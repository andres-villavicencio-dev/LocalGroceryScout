# Google AdSense Setup Guide - Local Grocery Scout

This guide walks you through applying for and integrating Google AdSense to monetize free tier users.

## 📋 **Prerequisites**

Before applying for AdSense, ensure you have:

- ✅ **Deployed website** with live URL (not localhost)
- ✅ **Original content** (Local Grocery Scout provides unique price comparison service)
- ✅ **Privacy Policy** published and accessible
- ✅ **Terms of Service** published and accessible
- ✅ **Cookie consent banner** implemented (GDPR compliance)
- ✅ **Sufficient content** (price search functionality counts as valuable content)
- ✅ **Consistent traffic** (recommended: 50+ daily visitors, but not required)

**Note:** AdSense approval typically takes 1-2 weeks. You can implement the integration code before approval.

---

## ⏱️ **Estimated Time:** 30 minutes (plus 1-2 weeks approval wait)

---

## Step 1: Apply for Google AdSense (10 minutes)

### 1.1 Go to AdSense

Visit: https://www.google.com/adsense

### 1.2 Sign Up

1. Click **"Get Started"**
2. Enter your website URL: `https://yourdomain.com`
3. Select your country
4. Review and accept Terms & Conditions
5. Click **"Create account"**

### 1.3 Connect Your Site

You'll need to add a verification code to your website:

1. Copy the AdSense verification code provided
2. Add it to `/index.html` in the `<head>` section:

```html
<head>
  <!-- Other meta tags -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
     crossorigin="anonymous"></script>
</head>
```

3. Deploy your site
4. Return to AdSense and click **"I've added the code"**

---

## Step 2: Wait for Approval (1-2 weeks)

Google will review your site for:

- ✅ **Quality Content:** Your price comparison service is valuable content
- ✅ **Original Content:** Not copied from other sites
- ✅ **Sufficient Pages:** Homepage, search results, privacy policy, terms
- ✅ **Navigation:** Easy to navigate and find information
- ✅ **GDPR Compliance:** Privacy policy and cookie consent

**What to do while waiting:**
- Keep adding content (blog posts about saving money, grocery tips)
- Ensure privacy policy and terms are easily accessible
- Fix any technical issues
- Drive more traffic to your site

**Common Rejection Reasons:**
- Insufficient content
- Policy violations
- Site under construction
- Navigation issues
- Missing privacy policy

If rejected, address the issues and reapply after 7 days.

---

## Step 3: Get Your AdSense IDs (5 minutes)

Once approved, you'll receive an email. Then:

### 3.1 Get Publisher ID

1. Go to: https://www.google.com/adsense
2. Click **"Account"** → **"Account Information"**
3. Copy your **Publisher ID** (starts with `ca-pub-`)
   - Example: `ca-pub-1234567890123456`

### 3.2 Create Ad Unit

1. Go to **"Ads"** → **"By ad unit"**
2. Click **"+ Create ad unit"** → **"Display ad"**
3. Name it: `LocalGroceryScout-Banner`
4. Ad size: **Responsive**
5. Click **"Create"**
6. Copy the **Ad Slot ID** (numeric, e.g., `1234567890`)

---

## Step 4: Configure AdSense in Your App (5 minutes)

### 4.1 Update `.env` File

Add AdSense configuration to your `.env` file:

```bash
# Google AdSense Configuration
VITE_ADSENSE_CLIENT_ID=ca-pub-YOUR_PUBLISHER_ID
VITE_ADSENSE_SLOT_ID=YOUR_AD_SLOT_ID
```

**Example:**
```bash
VITE_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
VITE_ADSENSE_SLOT_ID=1234567890
```

### 4.2 Add AdSense Script to index.html

Update `/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Local Grocery Scout</title>

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
         crossorigin="anonymous"></script>
  </head>
  <body>
    <!-- App content -->
  </body>
</html>
```

---

## Step 5: Deploy and Test (10 minutes)

### 5.1 Build and Deploy

```bash
# Build with new AdSense configuration
npm run build

# Deploy to your hosting provider
# (Firebase Hosting, Vercel, Netlify, etc.)
firebase deploy --only hosting
```

### 5.2 Test Ad Display

1. Visit your live site (NOT localhost)
2. Ensure you're **not** a Pro user
3. Ensure cookie consent is set to allow advertising
4. You should see ads after a few minutes

**Note:** Ads may not show immediately:
- Allow 10-20 minutes for AdSense to start serving ads
- Ads may show blank initially while AdSense learns your content
- Use different browsers/incognito to see different ads
- Don't click your own ads (against AdSense policy!)

---

## Step 6: Verify Ad Performance (Ongoing)

### 6.1 Check AdSense Dashboard

1. Go to: https://www.google.com/adsense
2. Navigate to **"Reports"**
3. Monitor:
   - **Impressions:** How many times ads were shown
   - **Clicks:** How many times ads were clicked
   - **CTR (Click-Through Rate):** Clicks / Impressions
   - **RPM (Revenue Per Mille):** Revenue per 1000 impressions
   - **Earnings:** Total revenue

### 6.2 Expected Performance

| Metric | Typical Range | Target |
|--------|--------------|--------|
| **CTR** | 0.5% - 2% | > 1% |
| **RPM** | $1 - $5 | > $2 |
| **Monthly Revenue (1000 users)** | $50 - $500 | > $100 |

---

## AdSense Best Practices

### ✅ Do's

- ✅ Place ads where they're visible but not intrusive
- ✅ Use responsive ad units that adapt to screen size
- ✅ Respect user experience (don't overwhelm with ads)
- ✅ Provide value to users (good price comparisons = more engagement)
- ✅ Monitor performance and adjust placement
- ✅ Ensure GDPR compliance with cookie consent
- ✅ Keep content fresh and updated

### ❌ Don'ts

- ❌ Click your own ads or ask others to click
- ❌ Place ads on pages with little/no content
- ❌ Use misleading practices to increase clicks
- ❌ Show ads on error pages
- ❌ Place more than 3 ad units per page
- ❌ Modify ad code (except as specified by Google)
- ❌ Cover ads with other elements

---

## Troubleshooting

### Problem: Ads Not Showing

**Solutions:**
1. Check `.env` file has correct AdSense IDs
2. Ensure you're on live site (not localhost)
3. Verify AdSense script is in `index.html`
4. Wait 10-20 minutes after deployment
5. Check browser console for errors
6. Verify user has consented to advertising cookies
7. Ensure user is not a Pro subscriber

### Problem: "Account at Risk" Warning

**Solutions:**
1. Review AdSense policy violations
2. Check for invalid click activity
3. Ensure compliance with all AdSense policies
4. Appeal if you believe warning is in error

### Problem: Low Revenue

**Solutions:**
1. Increase traffic to your site (SEO, marketing)
2. Improve user engagement (better search results)
3. Optimize ad placement (A/B testing)
4. Use responsive ad units
5. Target high-value niches (grocery shopping is good!)
6. Ensure ads are visible above the fold

### Problem: Cookie Consent Not Working

**Solutions:**
1. Check `CookieConsent` component is rendered in App
2. Verify localStorage `cookie_consent` is set
3. Test with different consent preferences
4. Check browser console for errors

---

## Revenue Optimization Tips

### 1. Ad Placement

**Best Locations:**
- ✅ After search bar (current placement)
- ✅ Between search results
- ✅ In sidebar (desktop only)
- ✅ After shopping list

**Avoid:**
- ❌ Before main content
- ❌ Blocking navigation
- ❌ Too many ads clustered together

### 2. Increase Engagement

- Quality price data = more searches = more ad views
- Shopping list features = repeat visits
- Price history = increased session time
- Email notifications = returning users

### 3. Drive Traffic

- SEO optimization (grocery price keywords)
- Social media sharing
- Blog content about saving money
- Local grocery tips and guides
- Partner with coupon sites

---

## GDPR Compliance Checklist

Required for AdSense and legal compliance:

- [x] Privacy Policy published and linked
- [x] Terms of Service published and linked
- [x] Cookie consent banner implemented
- [x] Users can opt-out of personalized ads
- [x] Data retention policies documented
- [x] User data deletion process
- [ ] Register with data protection authority (if EU-based business)

---

## Alternative Ad Networks

If AdSense rejects your application or you want additional revenue:

### 1. **Media.net**
- Yahoo/Bing network
- Similar to AdSense
- Approval: Easier than AdSense
- Revenue: Slightly lower than AdSense

### 2. **Ezoic**
- AI-powered ad optimization
- Requires 10,000+ monthly visitors
- Revenue: Potentially higher than AdSense
- More complex setup

### 3. **AdThrive / Mediavine**
- Premium ad networks
- Requires 100,000+ monthly page views
- Revenue: Highest potential
- Professional support

---

## Monitoring & Reporting

### Daily Checks
- AdSense dashboard for earnings
- Check for policy violations
- Monitor CTR and RPM

### Weekly Analysis
- Review top-performing pages
- Analyze user engagement
- Check conversion to Pro (ads should encourage upgrades)

### Monthly Review
- Total revenue vs. goals
- Pro conversion rate
- User feedback about ads
- A/B test ad placements

---

## FAQ

**Q: How long until I see revenue?**
A: After approval, ads start showing within hours. Revenue appears in AdSense dashboard next day.

**Q: How much can I earn?**
A: Depends on traffic. Average: $1-3 per 1000 page views. With 1000 daily active users, expect $30-100/month.

**Q: Can I use AdSense with Pro subscriptions?**
A: Yes! Pro users see no ads, free users see ads. This is allowed and encouraged.

**Q: What if AdSense rejects my application?**
A: Address the issues mentioned, wait 7 days, and reapply. Common issues: content quality, navigation, privacy policy.

**Q: Should I show more ads to make more money?**
A: No! Too many ads hurt user experience and violate AdSense policies. 1-2 ads per page is optimal.

**Q: Will ads slow down my site?**
A: AdSense async loading has minimal impact. Our implementation loads ads after page content loads.

---

## Contact & Support

**Google AdSense Support:**
- Help Center: https://support.google.com/adsense
- Community: https://support.google.com/adsense/community
- Policy Center: https://support.google.com/adsense/answer/48182

**Local Grocery Scout:**
- Issues: Create GitHub issue
- Questions: Check documentation

---

**Last Updated:** January 11, 2026
**Status:** Ready for implementation
