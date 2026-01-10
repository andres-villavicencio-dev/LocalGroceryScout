# Stripe Setup Guide - Local Grocery Scout

This guide will walk you through setting up Stripe for the Local Grocery Scout payment system.

## Table of Contents
1. [Create Stripe Account](#1-create-stripe-account)
2. [Create Product & Pricing](#2-create-product--pricing)
3. [Get API Keys](#3-get-api-keys)
4. [Configure Webhook Endpoint](#4-configure-webhook-endpoint)
5. [Configure Firebase Functions](#5-configure-firebase-functions)
6. [Update Frontend Configuration](#6-update-frontend-configuration)
7. [Testing](#7-testing)

---

## 1. Create Stripe Account

### Steps:
1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Fill in your email, name, and password
4. Verify your email address
5. Complete business information (required for production)

### Important:
- Start in **Test Mode** (toggle in dashboard)
- You'll have separate test and live keys
- Test mode uses test card numbers (no real charges)

---

## 2. Create Product & Pricing

### Create the Pro Membership Product:

1. Go to: https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Fill in product details:
   - **Name:** Pro Membership
   - **Description:** Local Grocery Scout Pro - Unlimited searches, ad-free experience
   - **Image:** (Optional) Upload a logo
4. Set pricing:
   - **Pricing model:** Standard pricing
   - **Price:** $4.99
   - **Billing period:** Monthly
   - **Currency:** USD
5. Click **"Save product"**

### Copy the Price ID:
- After saving, you'll see a Price ID like: `price_1ABC123xyz...`
- **Copy this ID** - you'll need it for Firebase configuration
- It starts with `price_` followed by alphanumeric characters

---

## 3. Get API Keys

### For Development (Test Mode):

1. Ensure you're in **Test Mode** (toggle at top of dashboard)
2. Go to: https://dashboard.stripe.com/test/apikeys
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`) - Used in frontend
   - **Secret key** (starts with `sk_test_...`) - Used in backend

**Example:**
```
Publishable key: pk_test_51ABC123xyz...
Secret key: sk_test_51ABC123xyz...
```

### For Production (Live Mode):

1. Toggle to **Live Mode**
2. Complete Stripe account activation (business verification)
3. Go to: https://dashboard.stripe.com/apikeys
4. Copy your live keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

---

## 4. Configure Webhook Endpoint

Webhooks allow Stripe to notify your backend when events occur (payments, cancellations, etc.)

### 4.1 Deploy Cloud Functions First

Before configuring webhooks, deploy your functions to get the URL:

```bash
# From project root
firebase deploy --only functions
```

After deployment, you'll get a URL like:
```
https://us-central1-local-grocery-scout.cloudfunctions.net/handleStripeWebhook
```

### 4.2 Create Webhook in Stripe Dashboard

#### For Test Mode:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Enter your webhook URL:
   ```
   https://us-central1-local-grocery-scout.cloudfunctions.net/handleStripeWebhook
   ```
4. Click **"Select events"**
5. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
6. Click **"Add events"** then **"Add endpoint"**
7. **Copy the Signing Secret** (starts with `whsec_...`)

#### For Production (Live Mode):
- Repeat the same steps in Live Mode
- Use the same webhook URL (it handles both test and live events)
- Copy the **Live Mode** signing secret (different from test)

### 4.3 Test Webhook Delivery

1. In webhook settings, click "Send test webhook"
2. Select an event (e.g., `invoice.payment_succeeded`)
3. Click "Send test webhook"
4. Check response - should get `200 OK`

---

## 5. Configure Firebase Functions

Now configure your Firebase Functions with the Stripe keys:

### For Test Mode (Development):

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_YOUR_TEST_KEY" \
  stripe.webhook_secret="whsec_YOUR_TEST_WEBHOOK_SECRET" \
  stripe.price_id="price_YOUR_PRICE_ID"
```

**Example:**
```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_51ABC123xyz..." \
  stripe.webhook_secret="whsec_abc123xyz..." \
  stripe.price_id="price_1ABC123xyz..."
```

### For Production (Live Mode):

```bash
firebase functions:config:set \
  stripe.secret_key="sk_live_YOUR_LIVE_KEY" \
  stripe.webhook_secret="whsec_YOUR_LIVE_WEBHOOK_SECRET" \
  stripe.price_id="price_YOUR_LIVE_PRICE_ID"
```

### Verify Configuration:

```bash
firebase functions:config:get
```

You should see:
```json
{
  "stripe": {
    "secret_key": "sk_test_...",
    "webhook_secret": "whsec_...",
    "price_id": "price_..."
  }
}
```

### Local Development (Optional):

For local testing with Firebase emulators, create `.env` file in `functions/` directory:

```bash
# functions/.env
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PRICE_ID=price_YOUR_PRICE_ID
```

**Important:** Never commit `.env` to git!

---

## 6. Update Frontend Configuration

### 6.1 Create Environment File

Create `.env` file in project root:

```bash
# .env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

### 6.2 For Production

Create `.env.production`:

```bash
# .env.production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

### 6.3 Update .gitignore

Ensure `.env` files are ignored:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
```

---

## 7. Testing

### 7.1 Test Cards

Stripe provides test card numbers that simulate different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Insufficient funds |

**For all test cards:**
- Use any future expiration date (e.g., `12/34`)
- Use any 3-digit CVC (e.g., `123`)
- Use any ZIP code (e.g., `12345`)

Full list: https://stripe.com/docs/testing

### 7.2 Test Payment Flow

1. Run your app locally: `npm run dev`
2. Click "Upgrade to Pro"
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. You should be redirected back to your app
7. Check Firestore - `isPro` should be `true`

### 7.3 Test Webhooks Locally

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

Login to Stripe:
```bash
stripe login
```

Forward webhooks to local function:
```bash
# Start Firebase emulators first
firebase emulators:start

# In another terminal, forward webhooks
stripe listen --forward-to http://localhost:5001/local-grocery-scout/us-central1/handleStripeWebhook
```

Trigger test events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
```

### 7.4 Monitor Logs

Firebase logs:
```bash
firebase functions:log
```

Stripe logs:
- Go to: https://dashboard.stripe.com/test/logs
- View webhook attempts and responses

---

## Quick Reference

### Stripe Dashboard URLs

| Resource | Test Mode | Live Mode |
|----------|-----------|-----------|
| API Keys | https://dashboard.stripe.com/test/apikeys | https://dashboard.stripe.com/apikeys |
| Products | https://dashboard.stripe.com/test/products | https://dashboard.stripe.com/products |
| Webhooks | https://dashboard.stripe.com/test/webhooks | https://dashboard.stripe.com/webhooks |
| Subscriptions | https://dashboard.stripe.com/test/subscriptions | https://dashboard.stripe.com/subscriptions |
| Logs | https://dashboard.stripe.com/test/logs | https://dashboard.stripe.com/logs |

### Firebase Commands

```bash
# Configure Stripe keys
firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..." stripe.price_id="price_..."

# View configuration
firebase functions:config:get

# Deploy functions
firebase deploy --only functions

# Deploy security rules
firebase deploy --only firestore:rules

# View logs
firebase functions:log

# Start emulators
firebase emulators:start
```

### Environment Variables Summary

| Variable | Location | Purpose | Example |
|----------|----------|---------|---------|
| `stripe.secret_key` | Firebase Config | Backend API calls | `sk_test_...` |
| `stripe.webhook_secret` | Firebase Config | Verify webhooks | `whsec_...` |
| `stripe.price_id` | Firebase Config | Subscription price | `price_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend `.env` | Client-side Stripe | `pk_test_...` |

---

## Troubleshooting

### Issue: "No such price: price_..."

**Solution:**
- Verify Price ID is correct in Firebase config
- Check you're using the right mode (test vs live)
- Price ID should start with `price_` not `prod_`

### Issue: "Invalid webhook signature"

**Solution:**
- Verify webhook secret is correct: `firebase functions:config:get stripe.webhook_secret`
- Check webhook signing secret in Stripe Dashboard matches
- Ensure you're using the correct mode (test vs live secrets)

### Issue: "Functions not receiving config"

**Solution:**
```bash
# Re-set configuration
firebase functions:config:set stripe.secret_key="sk_test_..."

# Re-deploy
firebase deploy --only functions
```

### Issue: "Payment succeeds but isPro stays false"

**Solution:**
1. Check webhook is configured correctly
2. View webhook delivery in Stripe Dashboard
3. Check Firebase Functions logs: `firebase functions:log`
4. Verify Firestore security rules allow admin writes
5. Check user has `stripeCustomerId` in Firestore

---

## Security Checklist

Before going to production:

- [ ] Never commit API keys to git
- [ ] Use environment variables for all keys
- [ ] Verify webhook signature in backend
- [ ] Test with test mode first
- [ ] Deploy Firestore security rules
- [ ] Test security rules (try to set isPro from client)
- [ ] Complete Stripe account verification
- [ ] Enable Stripe Radar for fraud protection
- [ ] Set up email notifications for failed payments
- [ ] Monitor webhook delivery

---

## Next Steps

After completing setup:

1. ✅ Test complete payment flow with test cards
2. ✅ Verify webhook events update Firestore correctly
3. ✅ Test subscription cancellation flow
4. ✅ Test Customer Portal (manage subscription)
5. ✅ Deploy to production
6. ✅ Switch to live mode keys
7. ✅ Complete one real test transaction (refund after)
8. ✅ Set up monitoring and alerts

---

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Firebase Functions:** https://firebase.google.com/docs/functions
- **Stripe Community:** https://discord.gg/stripe

---

**Last Updated:** 2026-01-10
**Version:** 1.0
**Status:** Ready for Setup
