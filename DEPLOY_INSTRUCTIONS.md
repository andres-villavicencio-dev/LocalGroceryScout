# Deployment Instructions - Stripe Integration

Your Stripe configuration is ready! Follow these steps to deploy and test.

## ✅ **What's Already Configured:**

- ✅ Frontend `.env` file with publishable key
- ✅ Backend `functions/.env` file with secret key and price ID
- ✅ All code ready to deploy

---

## 🚀 **Step 1: Authenticate with Firebase (One-time)**

```bash
firebase login
```

This will open a browser window to authenticate. Sign in with your Google account that has access to the `local-grocery-scout` Firebase project.

---

## 🚀 **Step 2: Deploy Cloud Functions**

```bash
firebase deploy --only functions
```

**Expected output:**
```
✔  Deploy complete!

Functions deployed:
  createCheckoutSession(us-central1)
  handleStripeWebhook(us-central1)
  createPortalSession(us-central1)
  verifySubscriptionStatus(us-central1)

Function URL (handleStripeWebhook):
  https://us-central1-local-grocery-scout.cloudfunctions.net/handleStripeWebhook
```

**IMPORTANT:** Copy the `handleStripeWebhook` URL - you'll need it for the next step!

---

## 🪝 **Step 3: Configure Stripe Webhook**

1. Go to: https://dashboard.stripe.com/test/webhooks

2. Click **"+ Add endpoint"**

3. **Endpoint URL:** Paste your function URL from Step 2
   ```
   https://us-central1-local-grocery-scout.cloudfunctions.net/handleStripeWebhook
   ```

4. Click **"Select events"**

5. Select these 5 events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`

6. Click **"Add events"** → **"Add endpoint"**

7. **COPY the Signing Secret** (starts with `whsec_...`)

8. Add it to `functions/.env`:
   ```bash
   # Edit functions/.env and update the STRIPE_WEBHOOK_SECRET line:
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

9. **Re-deploy functions** with webhook secret:
   ```bash
   firebase deploy --only functions
   ```

---

## 🔒 **Step 4: Deploy Firestore Security Rules**

```bash
firebase deploy --only firestore:rules
```

This prevents users from manually setting `isPro = true` in the database.

---

## ✅ **Step 5: Verify Deployment**

Check that everything is deployed:

```bash
# Check functions are live
firebase functions:list

# Check Firestore rules are deployed
firebase firestore:rules:list
```

---

## 🧪 **Step 6: Test Payment Flow**

### Start the App

```bash
npm run dev
```

### Test the Payment

1. Open http://localhost:5173

2. Sign in or continue as guest

3. Search for a product 5 times (to hit the free tier limit)

4. Click **"Upgrade to Pro"** when the modal appears

5. You should be redirected to Stripe Checkout

6. Use test card:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/34`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **ZIP:** Any 5 digits (e.g., `12345`)

7. Click **"Subscribe"**

8. You should be redirected to the success page

9. Return to the app - you should now be a Pro user!

### Verify the Payment

**In Firestore:**
- Go to: https://console.firebase.google.com/project/local-grocery-scout/firestore
- Find your user document in `users/{userId}`
- Verify: `isPro: true`, `subscriptionId`, `stripeCustomerId` are set

**In Stripe Dashboard:**
- Go to: https://dashboard.stripe.com/test/subscriptions
- You should see your new subscription

**Check Webhook Delivery:**
- Go to: https://dashboard.stripe.com/test/webhooks
- Click on your webhook endpoint
- Click "Events" tab
- You should see events with "Success" status

**Check Firebase Logs:**
```bash
firebase functions:log
```

Look for:
- "Checkout session created for user..."
- "User upgraded to Pro"
- "Webhook received: checkout.session.completed"

---

## 🎉 **Success Indicators**

✅ Payment completes in Stripe
✅ User redirected to success page
✅ `isPro: true` in Firestore
✅ Ads disappear from app
✅ Search limits removed
✅ Webhook shows "Success" in Stripe Dashboard
✅ Function logs show subscription created

---

## 🐛 **Troubleshooting**

### "Functions not found" or deployment fails

```bash
# Make sure you're in the project root
cd /home/user/LocalGroceryScout

# Verify Firebase project
firebase projects:list
firebase use local-grocery-scout

# Try deploying again
firebase deploy --only functions
```

### "Invalid API key" error

- Check `functions/.env` has the correct `STRIPE_SECRET_KEY`
- Verify key starts with `sk_test_`
- Ensure no extra spaces in the .env file

### Webhook not receiving events

- Verify webhook URL matches deployed function URL
- Check webhook events are selected (all 5 events)
- Test webhook in Stripe Dashboard: "Send test webhook"
- Check Firebase function logs: `firebase functions:log`

### Payment succeeds but `isPro` stays false

- Check webhook is configured with signing secret
- Verify webhook secret in `functions/.env`
- Check Firebase function logs for webhook errors
- Verify Firestore security rules allow admin writes

### "User must be authenticated" error

- Sign in or create an account before upgrading
- Guest users won't be able to upgrade (by design)

---

## 📊 **Monitor Your Deployment**

### Firebase Console
- Functions: https://console.firebase.google.com/project/local-grocery-scout/functions
- Firestore: https://console.firebase.google.com/project/local-grocery-scout/firestore
- Logs: https://console.firebase.google.com/project/local-grocery-scout/logs

### Stripe Dashboard
- Subscriptions: https://dashboard.stripe.com/test/subscriptions
- Webhooks: https://dashboard.stripe.com/test/webhooks
- Events: https://dashboard.stripe.com/test/events
- Logs: https://dashboard.stripe.com/test/logs

---

## 🎯 **Next Steps After Testing**

Once test mode is working:

1. **Complete Stripe account verification** (for live mode)
2. **Get live API keys** (pk_live_... and sk_live_...)
3. **Create production .env files**
4. **Deploy to production** (same steps but with live keys)
5. **Test with real card** (then refund)
6. **Monitor first week** of real subscriptions

---

## 💡 **Quick Commands Reference**

```bash
# Authenticate
firebase login

# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# View function logs
firebase functions:log

# Start dev server
npm run dev
```

---

**Questions?** Check the comprehensive guides:
- `docs/QUICK_START_STRIPE.md`
- `docs/STRIPE_SETUP_GUIDE.md`
- `docs/MONETIZATION_IMPLEMENTATION_PLAN.md`

**Last Updated:** 2026-01-11
**Status:** Ready to deploy!
