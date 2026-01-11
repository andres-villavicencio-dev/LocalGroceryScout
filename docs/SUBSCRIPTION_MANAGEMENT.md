# Subscription Management Guide

## Overview
Pro users can manage their subscriptions through the Stripe Customer Portal, which is accessible directly from the app.

## How to Cancel or Manage Subscription

### For Pro Users

1. **Access Subscription Management** (3 ways):

   **Option 1: Pro Badge (Desktop)**
   - Look at the top-right navigation bar
   - Click on your Pro badge (amber/orange badge with ⭐ PRO)
   - Subscription management modal opens

   **Option 2: "Manage" Button**
   - Look at the top-right navigation bar next to Sign Out
   - Click the "Manage" button
   - Subscription management modal opens

   **Option 3: Direct Link** (future enhancement)
   - Navigate to account settings
   - Click "Manage Subscription"

2. **View Subscription Details**

   The Subscription View modal shows:
   - Current plan: Pro Plan ($4.99/month)
   - Subscription status: Active, Canceled, Past Due, etc.
   - Next billing date (or expiration date if canceled)
   - Days remaining until next billing
   - All Pro features included

3. **Open Stripe Customer Portal**

   - Click the "Manage Subscription" button in the modal
   - You'll be redirected to Stripe's secure Customer Portal
   - The portal opens in the same tab

4. **Cancel Subscription in Stripe Portal**

   In the Stripe Customer Portal you can:
   - **Cancel subscription**: Stop future billing
   - **Update payment method**: Change credit card
   - **View billing history**: See all past invoices
   - **Download invoices**: Get PDF receipts
   - **Update billing information**: Change address, email, etc.

### Cancellation Behavior

When you cancel your subscription:
- ✅ You keep Pro access until the end of your current billing period
- ✅ No more charges after the current period ends
- ✅ The app shows "Canceled" status with expiration date
- ✅ You can reactivate before the period ends (no charge)
- ❌ After expiration, you're downgraded to Free plan

Example:
```
Subscribed on: Jan 1, 2024
Canceled on: Jan 15, 2024
Still Pro until: Feb 1, 2024 (end of billing period)
Downgraded to Free: Feb 2, 2024
```

## UI Components

### SubscriptionView Modal (components/SubscriptionView.tsx)

**Features:**
- Displays current subscription status
- Shows next billing date
- Lists all Pro features
- "Manage Subscription" button → Opens Stripe Portal
- "Powered by Stripe" branding

**Status Badges:**
- 🟢 **Active**: Subscription is active and paid
- 🔴 **Canceled**: User canceled, still has access until period end
- 🟡 **Past Due**: Payment failed, needs payment method update
- 🔵 **Trialing**: In trial period (if applicable)

**Visual Design:**
- Gradient header (emerald to teal)
- Pro plan highlighted with emerald gradient background
- Free plan shown with gray background
- Responsive design for mobile and desktop

### Access Points

1. **Pro Badge in Navigation**
   - Location: Top-right, next to user name
   - Visibility: Pro users only (desktop)
   - Click action: Opens SubscriptionView modal

2. **"Manage" Button**
   - Location: Top-right, between Pro badge and Sign Out
   - Visibility: Pro users only
   - Click action: Opens SubscriptionView modal

## Stripe Customer Portal Features

The Stripe Customer Portal (opened from "Manage Subscription" button) provides:

### Subscription Management
- Cancel subscription
- Resume canceled subscription (if still in current period)
- View current plan details
- See next invoice amount and date

### Payment Methods
- Add new payment method
- Remove old payment methods
- Set default payment method
- Update billing address

### Billing History
- View all past invoices
- Download invoice PDFs
- See payment status (paid, failed, refunded)
- View invoice details

### Contact Information
- Update email address for receipts
- Update billing address
- Update phone number

## Webhook Handling

When a user cancels in Stripe Portal:

1. Stripe sends webhook event: `customer.subscription.deleted` or `customer.subscription.updated`
2. Firebase Cloud Function `handleStripeWebhook` processes event
3. Firestore user document updated:
   - `subscriptionStatus` → "canceled"
   - `subscriptionEndDate` → end of current period
4. User still has `isPro: true` until end date
5. Another webhook fires at period end
6. Function updates: `isPro: false`
7. User automatically downgraded to Free plan

## Security & Data Protection

### What We Store
- Stripe Customer ID (for linking user to Stripe)
- Stripe Subscription ID (for tracking subscription)
- Subscription status (active, canceled, past_due)
- Subscription end date (next billing or expiration)
- `isPro` boolean flag

### What We DON'T Store
- ❌ Credit card numbers
- ❌ CVV codes
- ❌ Full payment method details
- ❌ Billing addresses (except in Stripe)

All payment data is securely handled by Stripe (PCI DSS Level 1 certified).

### Firestore Security Rules

Users cannot manually set their own Pro status:

```javascript
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow update: if request.auth.uid == userId
    && !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['isPro', 'subscriptionId', 'stripeCustomerId',
               'subscriptionStatus', 'subscriptionEndDate']);
}
```

Only Firebase Cloud Functions (via webhooks) can update subscription fields.

## Testing

### Test Cancellation Flow (Test Mode)

1. Create Pro subscription with test card (4242 4242 4242 4242)
2. Sign in to app as Pro user
3. Click Pro badge or "Manage" button
4. Click "Manage Subscription"
5. In Stripe Portal, click "Cancel subscription"
6. Confirm cancellation
7. Return to app → Status should show "Canceled"
8. Check Firestore → `subscriptionStatus: "canceled"`

### Test Reactivation

1. After canceling, reopen Stripe Portal (still in billing period)
2. Click "Renew subscription"
3. Return to app → Status should show "Active"
4. Check Firestore → `subscriptionStatus: "active"`

## Troubleshooting

### "Failed to open subscription management"

**Cause**: Stripe Customer ID not found or network error

**Solution**:
1. Check Firestore: Does user have `stripeCustomerId` field?
2. Check Firebase Functions logs for errors
3. Verify Stripe API keys are correct in `functions/.env`
4. Try signing out and signing back in

### "Manage Subscription" button not showing

**Cause**: User is not Pro or not signed in

**Solution**:
1. Verify user is signed in
2. Check Firestore: `isPro: true`?
3. Check `localStorage`: `grocery_is_pro` set to "true"?
4. Try refreshing the page

### Canceled but still showing "Active"

**Cause**: Webhook may not have processed yet

**Solution**:
1. Wait 1-2 minutes for webhook processing
2. Refresh the page
3. Check Firebase Functions logs for webhook errors
4. Verify webhook secret in `functions/.env`

### Can't access Stripe Portal

**Cause**: Session creation failed

**Solution**:
1. Check console for error messages
2. Verify user has valid `stripeCustomerId`
3. Check Firebase Functions logs
4. Ensure `STRIPE_SECRET_KEY` is set correctly

## Related Files

- `components/SubscriptionView.tsx` - Subscription management modal UI
- `services/stripeService.ts` - `createPortalSession()` function
- `functions/src/index.ts` - `createPortalSession` Cloud Function
- `functions/src/index.ts` - `handleStripeWebhook` for cancellation
- `App.tsx` - Integration of SubscriptionView modal

## Future Enhancements

- [ ] Add "Cancel Subscription" button directly in app (bypassing Stripe Portal)
- [ ] Show cancellation confirmation dialog before opening portal
- [ ] Add ability to pause subscription instead of cancel
- [ ] Send email notification when subscription is canceled
- [ ] Show countdown timer for canceled subscriptions
- [ ] Add "Reactivate" button for canceled subscriptions (if in period)
- [ ] Analytics tracking for cancellation reasons
- [ ] Exit survey when user cancels
- [ ] Offer discount/downgrade option before cancellation
- [ ] Add subscription management page in settings
