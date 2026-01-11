/**
 * Firebase Cloud Functions for Local Grocery Scout
 * Handles Stripe payment processing, subscriptions, and webhooks
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with secret key from Firebase config
// Set up in Firebase: firebase functions:config:set stripe.secret_key="sk_test_..."
const stripeSecretKey = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY || '';
const stripeWebhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '';
const stripePriceId = functions.config().stripe?.price_id || process.env.STRIPE_PRICE_ID || '';

if (!stripeSecretKey) {
  console.error('WARNING: Stripe secret key not configured!');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Firestore database reference
const db = admin.firestore();

/**
 * CLOUD FUNCTION 1: Create Checkout Session
 *
 * Creates a Stripe Checkout Session for users to subscribe to Pro
 *
 * @param userId - The authenticated user's Firebase UID
 * @param email - User's email address
 * @returns {checkoutUrl: string} - URL to redirect user to Stripe Checkout
 */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Security: Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create a checkout session'
    );
  }

  const userId = context.auth.uid;
  const email = context.auth.token.email || data.email;

  if (!email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User email is required'
    );
  }

  try {
    // Check if user already has an active subscription
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (userData?.isPro && userData?.subscriptionStatus === 'active') {
      throw new functions.https.HttpsError(
        'already-exists',
        'User already has an active subscription'
      );
    }

    // Get or create Stripe customer
    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to Firestore
      await db.collection('users').doc(userId).set(
        {
          stripeCustomerId: customerId,
          email: email,
        },
        { merge: true }
      );
    }

    // Determine success and cancel URLs
    // In production, use your actual domain
    const successUrl = data.successUrl || `${data.origin || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = data.cancelUrl || `${data.origin || 'http://localhost:5173'}/`;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId, // Your $4.99/month price ID from Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUID: userId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    functions.logger.info(`Checkout session created for user ${userId}`, {
      sessionId: session.id,
      customerId: customerId,
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (error: any) {
    functions.logger.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to create checkout session: ${error.message}`
    );
  }
});

/**
 * CLOUD FUNCTION 2: Handle Stripe Webhooks
 *
 * Processes webhook events from Stripe to update subscription status
 * CRITICAL: Verifies webhook signature for security
 *
 * Handles events:
 * - checkout.session.completed: Initial subscription created
 * - invoice.payment_succeeded: Subscription payment successful (renewal)
 * - customer.subscription.updated: Subscription modified
 * - customer.subscription.deleted: Subscription cancelled
 */
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    functions.logger.error('No Stripe signature found in request');
    res.status(400).send('No signature');
    return;
  }

  let event: Stripe.Event;

  try {
    // CRITICAL SECURITY: Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      stripeWebhookSecret
    );
  } catch (err: any) {
    functions.logger.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  functions.logger.info(`Webhook received: ${event.type}`, { eventId: event.id });

  try {
    // Check for idempotency - prevent duplicate processing
    const eventDoc = db.collection('processedWebhooks').doc(event.id);
    const eventSnapshot = await eventDoc.get();

    if (eventSnapshot.exists) {
      functions.logger.info(`Event ${event.id} already processed, skipping`);
      res.status(200).json({ received: true, skipped: true });
      return;
    }

    // Mark event as processed
    await eventDoc.set({
      eventId: event.id,
      type: event.type,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        functions.logger.info(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    functions.logger.error('Error processing webhook:', error);
    res.status(500).send(`Webhook processing error: ${error.message}`);
  }
});

/**
 * Handle checkout.session.completed event
 * User successfully completed payment and subscription is created
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUID;

  if (!userId) {
    functions.logger.error('No Firebase UID in session metadata');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Retrieve subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update user in Firestore
  await db.collection('users').doc(userId).set(
    {
      isPro: true,
      stripeCustomerId: customerId,
      subscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
      lastVerified: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  functions.logger.info(`User ${userId} upgraded to Pro`, {
    subscriptionId,
    customerId,
  });
}

/**
 * Handle invoice.payment_succeeded event
 * Subscription payment successful (including renewals)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  // Find user by customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    functions.logger.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;

  // Retrieve subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update user subscription status
  await db.collection('users').doc(userId).set(
    {
      isPro: true,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
      lastVerified: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  functions.logger.info(`Subscription payment succeeded for user ${userId}`, {
    subscriptionId,
    invoiceId: invoice.id,
  });
}

/**
 * Handle customer.subscription.updated event
 * Subscription status changed (e.g., trial ending, plan change)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    functions.logger.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;

  // Determine if user should still be Pro
  const isPro = subscription.status === 'active' || subscription.status === 'trialing';

  // Update user subscription status
  await db.collection('users').doc(userId).set(
    {
      isPro: isPro,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
      lastVerified: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  functions.logger.info(`Subscription updated for user ${userId}`, {
    subscriptionId: subscription.id,
    status: subscription.status,
    isPro,
  });
}

/**
 * Handle customer.subscription.deleted event
 * Subscription cancelled or expired
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    functions.logger.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;

  // Downgrade user to free tier
  await db.collection('users').doc(userId).set(
    {
      isPro: false,
      subscriptionStatus: 'canceled',
      subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
      lastVerified: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  functions.logger.info(`Subscription deleted for user ${userId}`, {
    subscriptionId: subscription.id,
  });
}

/**
 * Handle invoice.payment_failed event
 * Payment failed (card declined, insufficient funds, etc.)
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  // Find user by customer ID
  const usersSnapshot = await db
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    functions.logger.error(`No user found for customer ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const userId = userDoc.id;

  // Update subscription status to past_due
  // Stripe will continue retrying the payment
  await db.collection('users').doc(userId).set(
    {
      subscriptionStatus: 'past_due',
      lastVerified: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  functions.logger.warn(`Payment failed for user ${userId}`, {
    subscriptionId,
    invoiceId: invoice.id,
  });

  // TODO: Send notification to user about failed payment
  // Consider using Firebase Cloud Messaging or email service
}

/**
 * CLOUD FUNCTION 3: Create Customer Portal Session
 *
 * Creates a Stripe Customer Portal session for users to manage their subscription
 * Users can update payment methods, view billing history, and cancel subscription
 *
 * @param userId - The authenticated user's Firebase UID
 * @returns {portalUrl: string} - URL to redirect user to Stripe Customer Portal
 */
export const createPortalSession = functions.https.onCall(async (data, context) => {
  // Security: Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to access customer portal'
    );
  }

  const userId = context.auth.uid;

  try {
    // Get user's Stripe customer ID
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      throw new functions.https.HttpsError(
        'not-found',
        'No subscription found for this user'
      );
    }

    const customerId = userData.stripeCustomerId;

    // Determine return URL
    const returnUrl = data.returnUrl || `${data.origin || 'http://localhost:5173'}/account`;

    // Create Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    functions.logger.info(`Customer portal session created for user ${userId}`, {
      sessionId: session.id,
      customerId: customerId,
    });

    return {
      portalUrl: session.url,
    };
  } catch (error: any) {
    functions.logger.error('Error creating portal session:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to create portal session: ${error.message}`
    );
  }
});

/**
 * OPTIONAL: Verify Subscription Status
 *
 * Callable function to verify a user's subscription status directly with Stripe
 * Useful for additional security checks or when Firestore data might be stale
 */
export const verifySubscriptionStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.subscriptionId) {
      return {
        isPro: false,
        status: 'none',
      };
    }

    // Verify with Stripe
    const subscription = await stripe.subscriptions.retrieve(userData.subscriptionId);

    const isPro = subscription.status === 'active' || subscription.status === 'trialing';

    // Update Firestore if status changed
    if (userData.isPro !== isPro || userData.subscriptionStatus !== subscription.status) {
      await db.collection('users').doc(userId).set(
        {
          isPro: isPro,
          subscriptionStatus: subscription.status,
          subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
          lastVerified: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return {
      isPro: isPro,
      status: subscription.status,
      endDate: new Date(subscription.current_period_end * 1000).toISOString(),
    };
  } catch (error: any) {
    functions.logger.error('Error verifying subscription:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to verify subscription: ${error.message}`
    );
  }
});
