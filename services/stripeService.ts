/**
 * Stripe Service - Frontend
 * Handles Stripe Checkout integration and subscription management
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';

// Initialize Stripe with publishable key
// This key is safe to expose in frontend code
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

if (!stripePublishableKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY not configured. Payment features will not work.');
}

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (lazy loaded)
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

/**
 * Create a Stripe Checkout Session for Pro subscription
 * Redirects user to Stripe-hosted checkout page
 *
 * @param functions - Firebase Functions instance
 * @returns Promise that resolves when redirect occurs
 */
export const createCheckoutSession = async (functions: Functions): Promise<void> => {
  try {
    // Call Cloud Function to create checkout session
    const createSession = httpsCallable<
      { origin: string; successUrl: string; cancelUrl: string },
      { checkoutUrl: string; sessionId: string }
    >(functions, 'createCheckoutSession');

    const origin = window.location.origin;
    const result = await createSession({
      origin,
      successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: origin,
    });

    const { checkoutUrl } = result.data;

    if (!checkoutUrl) {
      throw new Error('No checkout URL returned from server');
    }

    // Redirect to Stripe Checkout
    window.location.href = checkoutUrl;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(
      error.message || 'Failed to create checkout session. Please try again.'
    );
  }
};

/**
 * Create a Stripe Customer Portal Session
 * Allows users to manage their subscription (cancel, update payment method, etc.)
 *
 * @param functions - Firebase Functions instance
 * @param returnUrl - Optional URL to return to after managing subscription
 * @returns Promise that resolves when redirect occurs
 */
export const createPortalSession = async (
  functions: Functions,
  returnUrl?: string
): Promise<void> => {
  try {
    // Call Cloud Function to create portal session
    const createSession = httpsCallable<
      { origin: string; returnUrl: string },
      { portalUrl: string }
    >(functions, 'createPortalSession');

    const origin = window.location.origin;
    const result = await createSession({
      origin,
      returnUrl: returnUrl || `${origin}/account`,
    });

    const { portalUrl } = result.data;

    if (!portalUrl) {
      throw new Error('No portal URL returned from server');
    }

    // Redirect to Stripe Customer Portal
    window.location.href = portalUrl;
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    throw new Error(
      error.message || 'Failed to open subscription management portal. Please try again.'
    );
  }
};

/**
 * Verify subscription status with Stripe
 * Optional function to double-check subscription status
 *
 * @param functions - Firebase Functions instance
 * @returns Promise with subscription status
 */
export const verifySubscriptionStatus = async (
  functions: Functions
): Promise<{
  isPro: boolean;
  status: string;
  endDate?: string;
}> => {
  try {
    const verify = httpsCallable<
      void,
      { isPro: boolean; status: string; endDate?: string }
    >(functions, 'verifySubscriptionStatus');

    const result = await verify();
    return result.data;
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    throw new Error('Failed to verify subscription status');
  }
};

/**
 * Check if Stripe is configured
 * Useful for showing/hiding payment features
 */
export const isStripeConfigured = (): boolean => {
  return !!stripePublishableKey;
};

/**
 * Format subscription status for display
 */
export const formatSubscriptionStatus = (status?: string): string => {
  if (!status) return 'None';

  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Format date for display
 */
export const formatSubscriptionDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Check if subscription is active
 */
export const isSubscriptionActive = (
  subscriptionStatus?: string
): boolean => {
  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
};

/**
 * Get days until subscription ends
 */
export const getDaysUntilEnd = (endDate?: string): number | null => {
  if (!endDate) return null;

  try {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  } catch {
    return null;
  }
};
