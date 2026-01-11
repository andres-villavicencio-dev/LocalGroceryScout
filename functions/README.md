# Firebase Cloud Functions - Local Grocery Scout

This directory contains Firebase Cloud Functions for handling payment processing, subscription management, and Stripe webhooks.

## Functions Overview

### 1. `createCheckoutSession`
**Type:** HTTPS Callable Function
**Purpose:** Creates a Stripe Checkout Session for users to subscribe to Pro ($4.99/month)

**Usage from frontend:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const createCheckout = httpsCallable(functions, 'createCheckoutSession');

const result = await createCheckout({
  origin: window.location.origin,
  successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: window.location.origin,
});

// Redirect to Stripe Checkout
window.location.href = result.data.checkoutUrl;
```

### 2. `handleStripeWebhook`
**Type:** HTTPS Request Function
**Purpose:** Processes webhook events from Stripe to update subscription status

**Webhook Events Handled:**
- `checkout.session.completed` - Initial subscription created
- `invoice.payment_succeeded` - Subscription payment successful (renewal)
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_failed` - Payment failed

**Security:** Verifies webhook signature to prevent spoofed events

### 3. `createPortalSession`
**Type:** HTTPS Callable Function
**Purpose:** Creates a Stripe Customer Portal session for users to manage their subscription

**Usage from frontend:**
```typescript
const functions = getFunctions();
const createPortal = httpsCallable(functions, 'createPortalSession');

const result = await createPortal({
  origin: window.location.origin,
  returnUrl: `${window.location.origin}/account`,
});

// Redirect to Stripe Customer Portal
window.location.href = result.data.portalUrl;
```

### 4. `verifySubscriptionStatus` (Optional)
**Type:** HTTPS Callable Function
**Purpose:** Verifies subscription status directly with Stripe API

---

## Setup Instructions

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created (already using: `local-grocery-scout`)
- Stripe account created
- Node.js 18+ installed

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Stripe in Firebase

You need to configure three Stripe values:

#### For Development (Test Mode)
```bash
firebase functions:config:set stripe.secret_key="sk_test_YOUR_TEST_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"
firebase functions:config:set stripe.price_id="price_YOUR_PRICE_ID"
```

#### For Production (Live Mode)
```bash
firebase functions:config:set stripe.secret_key="sk_live_YOUR_LIVE_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_LIVE_WEBHOOK_SECRET"
firebase functions:config:set stripe.price_id="price_YOUR_LIVE_PRICE_ID"
```

**Where to get these values:**

1. **Secret Key** (`sk_test_...` or `sk_live_...`)
   - Go to: https://dashboard.stripe.com/apikeys
   - Copy the "Secret key" (NOT the Publishable key)

2. **Price ID** (`price_...`)
   - Go to: https://dashboard.stripe.com/products
   - Create a product: "Pro Membership" - $4.99/month recurring
   - Copy the Price ID from the product page

3. **Webhook Secret** (`whsec_...`)
   - Go to: https://dashboard.stripe.com/webhooks
   - Add webhook endpoint (after deployment): `https://us-central1-local-grocery-scout.cloudfunctions.net/handleStripeWebhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the "Signing secret" (whsec_...)

### 3. Local Development with Environment Variables

For local testing, create `.env` file in `functions/` directory:

```bash
# functions/.env
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PRICE_ID=price_YOUR_PRICE_ID
```

**Note:** Never commit `.env` file to git! (Already in `.gitignore`)

### 4. Build Functions
```bash
npm run build
```

### 5. Test Locally (Optional)
```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, use Stripe CLI to forward webhooks
stripe listen --forward-to http://localhost:5001/local-grocery-scout/us-central1/handleStripeWebhook
```

### 6. Deploy to Firebase
```bash
# From project root
firebase deploy --only functions

# Or from functions directory
npm run deploy
```

---

## Testing Webhooks

### Local Testing with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to your local function:
```bash
stripe listen --forward-to http://localhost:5001/local-grocery-scout/us-central1/handleStripeWebhook
```

4. Trigger test events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
```

### Production Testing

After deployment:
1. Configure webhook endpoint in Stripe Dashboard
2. Use Stripe Dashboard to send test webhook
3. Monitor Firebase Functions logs:
```bash
firebase functions:log
```

---

## Firestore Data Structure

### User Document (`users/{userId}`)
```typescript
{
  // User profile
  name: string,
  email: string,
  avatar: string,

  // Subscription fields (ONLY writable by Cloud Functions)
  isPro: boolean,
  stripeCustomerId: string,
  subscriptionId: string,
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing',
  subscriptionEndDate: string (ISO),
  lastVerified: Timestamp,

  // Usage tracking
  dailySearches: number,
  lastSearchDate: string
}
```

### Processed Webhooks Collection (`processedWebhooks/{eventId}`)
Used for idempotency - prevents duplicate webhook processing
```typescript
{
  eventId: string,
  type: string,
  processedAt: Timestamp
}
```

---

## Security Considerations

### ✅ Implemented Security Measures

1. **Authentication Required**
   - All callable functions verify `context.auth` exists
   - Rejects unauthenticated requests

2. **Firestore Security Rules**
   - Users can READ their subscription status
   - Users CANNOT WRITE subscription fields (`isPro`, `subscriptionId`, etc.)
   - Only Cloud Functions (admin SDK) can update subscription data

3. **Webhook Signature Verification**
   - Every webhook verifies `stripe-signature` header
   - Prevents spoofed webhook attacks
   - Uses `stripe.webhooks.constructEvent()` with secret

4. **Idempotency**
   - Tracks processed webhook events in Firestore
   - Prevents duplicate processing if Stripe resends webhook

5. **Customer Validation**
   - Links Stripe customer to Firebase UID via metadata
   - Validates user owns the subscription before updating

### 🔒 Additional Security Recommendations

1. **Rate Limiting** (Optional)
   - Consider implementing rate limits on `createCheckoutSession`
   - Prevent abuse of checkout creation

2. **Audit Logging** (Optional)
   - Log all subscription changes
   - Track who initiated what action

3. **Error Monitoring**
   - Set up Firebase Crashlytics or Sentry
   - Alert on webhook processing failures

---

## Cost Estimates

### Firebase Costs (Blaze Plan)
- **Free Tier:** 2M function invocations/month
- **After Free Tier:** $0.40 per million invocations
- **Estimate for 1,000 users:** ~$5-25/month

### Stripe Costs
- **Transaction Fee:** 2.9% + $0.30 per transaction
- **$4.99/month subscription:** Fee = $0.44, Net = $4.55

---

## Troubleshooting

### Functions not deploying?
```bash
# Check Firebase CLI is logged in
firebase login

# Verify project is selected
firebase use local-grocery-scout

# Check for build errors
npm run build
```

### Webhooks not being received?
1. Check webhook URL in Stripe Dashboard is correct
2. Verify webhook secret is configured: `firebase functions:config:get stripe.webhook_secret`
3. Check Firebase Functions logs: `firebase functions:log`
4. Test signature verification locally with Stripe CLI

### Subscription not updating in Firestore?
1. Check webhook was received (Firebase logs)
2. Verify event ID wasn't already processed (check `processedWebhooks` collection)
3. Ensure Firestore security rules allow admin writes
4. Check customer ID mapping (user document should have `stripeCustomerId`)

### User bypassing payment?
1. Verify Firestore security rules are deployed: `firebase deploy --only firestore:rules`
2. Test rules in Firebase Console → Firestore → Rules tab → Rules Playground
3. Ensure frontend only READS `isPro` from Firestore, never writes

---

## Monitoring & Analytics

### Key Metrics to Track
- Conversion rate: upgrade modal views → completed payments
- Churn rate: subscription cancellations per month
- Failed payments: `invoice.payment_failed` events
- Webhook processing time
- Function invocation costs

### Firebase Console
- Monitor function invocations: https://console.firebase.google.com/project/local-grocery-scout/functions
- View logs: https://console.firebase.google.com/project/local-grocery-scout/logs

### Stripe Dashboard
- Monitor subscriptions: https://dashboard.stripe.com/subscriptions
- View webhooks: https://dashboard.stripe.com/webhooks
- Check failed payments: https://dashboard.stripe.com/payments?status[]=failed

---

## Next Steps

After deploying functions:

1. ✅ Configure Stripe webhook endpoint
2. ✅ Test payment flow with test cards
3. ✅ Update frontend to call these functions
4. ✅ Deploy Firestore security rules
5. ✅ Set up monitoring and alerts
6. ✅ Test in production with real transaction

---

## Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Last Updated:** 2026-01-10
**Version:** 1.0
**Status:** Ready for deployment
