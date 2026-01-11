# Stripe Configuration Values

This file tracks your Stripe configuration values for Local Grocery Scout.

## Product Configuration

**Product Name:** Pro Membership
**Description:** Local Grocery Scout Pro - Unlimited searches, ad-free experience
**Price:** $4.99/month
**Billing Period:** Monthly
**Currency:** USD

---

## Test Mode (Development)

### API Keys (from https://dashboard.stripe.com/test/apikeys)
```bash
# Publishable Key (starts with pk_test_) - CONFIGURED ✅
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SFCTs... (in .env file)

# Secret Key (starts with sk_test_) - CONFIGURED ✅
# DO NOT commit this to git!
STRIPE_SECRET_KEY=sk_test_51SFCTs... (in functions/.env file)
```

### Product & Pricing (from https://dashboard.stripe.com/test/products)
```bash
# Price ID (starts with price_) - CONFIGURED ✅
STRIPE_PRICE_ID=price_1SoIZpD8dms63MUGP4Dwg75i

# Product ID (for reference)
PRODUCT_ID=prod_TlqGl7MevzQ3fy
```

### Webhook (from https://dashboard.stripe.com/test/webhooks)
```bash
# Webhook Signing Secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Webhook Endpoint URL
# After deploying functions: https://us-central1-local-grocery-scout.cloudfunctions.net/handleStripeWebhook
```

---

## Production Mode (Live)

### API Keys (from https://dashboard.stripe.com/apikeys)
```bash
# Publishable Key (starts with pk_live_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE

# Secret Key (starts with sk_live_)
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
```

### Product & Pricing (from https://dashboard.stripe.com/products)
```bash
# Price ID (starts with price_)
STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE
```

### Webhook (from https://dashboard.stripe.com/webhooks)
```bash
# Webhook Signing Secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

---

## Configuration Commands

### Configure Firebase Functions (Test Mode)
```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_YOUR_KEY" \
  stripe.webhook_secret="whsec_YOUR_SECRET" \
  stripe.price_id="price_YOUR_PRICE_ID"
```

### Create Frontend .env File
```bash
# Create .env file in project root
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY" > .env
```

---

## Test Cards

Use these cards for testing (any future expiry date, any CVC):

- **Success:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 0002
- **Requires 3D Secure:** 4000 0025 0000 3155

---

## Setup Checklist

- [ ] Stripe account created
- [ ] Test mode enabled
- [ ] Product "Pro Membership" created ($4.99/month)
- [ ] Price ID copied
- [ ] Test API keys copied
- [ ] Firebase Functions configured
- [ ] Frontend .env file created
- [ ] Functions deployed
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Webhook signing secret copied
- [ ] Test payment with test card
- [ ] Verify webhook delivery

---

**Last Updated:** 2026-01-11
**Status:** Pending configuration
