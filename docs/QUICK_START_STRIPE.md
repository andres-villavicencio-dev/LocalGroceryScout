# Quick Start: Stripe Configuration

Follow these steps in order to get Stripe working with Local Grocery Scout.

## ⏱️ Estimated Time: 15 minutes

---

## Step 1: Create Stripe Account (3 minutes)

1. Go to https://stripe.com
2. Click "Start now" and sign up
3. Verify your email
4. **IMPORTANT:** Toggle to **Test Mode** (switch in top right)

---

## Step 2: Create Product (3 minutes)

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in:
   ```
   Name: Pro Membership
   Description: Local Grocery Scout Pro - Unlimited searches, ad-free experience
   Price: $4.99
   Billing period: Monthly
   Currency: USD
   ```
4. Click **"Save product"**
5. **COPY the Price ID** - it looks like: `price_1ABC123xyz...`
   - Save it in: `docs/STRIPE_CONFIG_VALUES.md`

---

## Step 3: Get API Keys (2 minutes)

1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see:
   - **Publishable key:** `pk_test_...` (visible)
   - **Secret key:** Click "Reveal test key" to see `sk_test_...`
3. **COPY both keys**
   - Save them in: `docs/STRIPE_CONFIG_VALUES.md`

---

## Step 4: Create Frontend .env File (1 minute)

In your project root directory:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and replace YOUR_PUBLISHABLE_KEY_HERE with your actual pk_test_ key
# Example:
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
```

Or manually create `.env` file with:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

---

## Step 5: Configure Firebase Functions (2 minutes)

### Option A: Using Firebase Config (Recommended for deployed functions)

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_YOUR_SECRET_KEY" \
  stripe.webhook_secret="SKIP_FOR_NOW" \
  stripe.price_id="price_YOUR_PRICE_ID"

# Verify configuration
firebase functions:config:get
```

**Note:** We'll set the webhook secret after deploying (Step 7)

### Option B: Using .env for Local Testing

```bash
# In functions/ directory
cp .env.example .env

# Edit functions/.env and fill in:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PRICE_ID=price_...
# STRIPE_WEBHOOK_SECRET=whsec_... (skip for now)
```

---

## Step 6: Deploy Firebase Functions (2 minutes)

```bash
# Make sure you're logged in
firebase login

# Deploy functions
firebase deploy --only functions

# You should see output like:
# ✔  functions[createCheckoutSession(us-central1)]: Successful create operation.
# ✔  functions[handleStripeWebhook(us-central1)]: Successful create operation.
# ✔  functions[createPortalSession(us-central1)]: Successful create operation.
```

**COPY the webhook URL** from the output. It looks like:
```
https://us-central1-local-grocery-scout.cloudfunctions.net/handleStripeWebhook
```

---

## Step 7: Configure Webhook (2 minutes)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** Paste your function URL from Step 6
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
7. **COPY the Signing Secret** (starts with `whsec_...`)

### Update Firebase Config with Webhook Secret

```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"

# Re-deploy functions with new config
firebase deploy --only functions
```

---

## Step 8: Deploy Firestore Security Rules (1 minute)

```bash
firebase deploy --only firestore:rules
```

This prevents users from manually setting `isPro = true` in the database.

---

## Step 9: Test Payment Flow (5 minutes)

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Open in browser:** http://localhost:5173

3. **Trigger upgrade modal:**
   - Search for a product 5 times (to hit free tier limit)
   - Or click any "Upgrade to Pro" button

4. **Test with Stripe test card:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. **Complete payment**
   - You should be redirected to Stripe Checkout
   - Enter test card details
   - Click "Subscribe"
   - You should be redirected back to success page

6. **Verify subscription:**
   - Check Firestore: `users/{yourUserId}` should have `isPro: true`
   - Check Stripe Dashboard: You should see a subscription
   - Ads should disappear from your app
   - Search limits should be removed

---

## Step 10: Verify Webhook Delivery (1 minute)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click on the "Events" tab
4. You should see events with "Success" status
5. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Stripe account created in Test Mode
- [ ] Product "Pro Membership" created at $4.99/month
- [ ] Frontend `.env` file created with publishable key
- [ ] Firebase Functions configured with secret key and price ID
- [ ] Functions deployed successfully
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Webhook secret configured in Firebase
- [ ] Firestore security rules deployed
- [ ] Test payment completed successfully
- [ ] `isPro: true` appears in Firestore after payment
- [ ] Webhook shows "Success" status in Stripe Dashboard

---

## 🐛 Troubleshooting

### "No Stripe publishable key found"
- Check `.env` file exists in project root
- Verify key starts with `pk_test_`
- Restart dev server: `npm run dev`

### "Invalid API key"
- Verify you're in Test Mode
- Check key copied correctly (no extra spaces)
- Ensure secret key is in Firebase config, not frontend

### "No such price"
- Verify Price ID starts with `price_`
- Check you copied from the product page, not product ID
- Ensure Firebase Functions config is set correctly

### Webhook not receiving events
- Verify webhook URL is correct function URL
- Check webhook signing secret matches Firebase config
- Test webhook in Stripe Dashboard: "Send test webhook"
- Check Firebase Functions logs for errors

### Payment succeeds but `isPro` stays false
- Check webhook endpoint is configured
- Verify webhook events are selected (Step 7)
- Check Firebase Functions logs: `firebase functions:log`
- Verify Firestore security rules allow admin writes

---

## 📚 Next Steps

Once test mode is working:

1. **Switch to Live Mode** when ready to accept real payments
2. **Complete Stripe account verification** (required for live mode)
3. **Get live API keys** and configure them
4. **Update frontend to production keys**
5. **Test with real card** (refund immediately)
6. **Monitor first week** of real transactions

---

## 🔒 Security Reminders

- ✅ Never commit `.env` files to git
- ✅ Never expose secret keys in frontend code
- ✅ Always use HTTPS for webhook endpoints
- ✅ Test in Test Mode before going live
- ✅ Monitor webhook delivery and function logs

---

**Need help?** Check the full guide: `docs/STRIPE_SETUP_GUIDE.md`

**Last Updated:** 2026-01-11
