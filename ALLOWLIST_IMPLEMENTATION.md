# Safe Allowlist Implementation Summary

## What Was Implemented

A comprehensive security allowlist system to protect your LocalGroceryScout app from:
- **Prompt injection attacks** on Gemini AI
- **XSS attacks** via user input
- **Database abuse** and overflow
- **Unauthorized field modifications**

---

## Files Created/Modified

### New Files Created

1. **`src/utils/allowlist.ts`** - Core allowlist configuration
   - Validation rules for all user inputs
   - Blocked patterns for prompt injection detection
   - System limits for lists, items, and price history
   - Firestore field allowlist

2. **`SECURITY_REVIEW.md`** - Monthly review documentation
   - Comprehensive checklist for monthly security reviews
   - Test cases to verify security
   - Incident response procedures
   - Review schedule tracker

3. **`firestore.rules`** - Firebase Security Rules
   - Server-side enforcement of allowlist
   - Field-level access controls
   - Ready to deploy to Firebase

### Files Modified

1. **`services/geminiService.ts`**
   - Added validation to `identifyProductFromBarcode()` (line 61)
   - Added validation to `fetchGroceryPrices()` (line 117)
   - Added validation to `fetchGroceryPricesForList()` (line 209)
   - Sanitizes all AI responses before returning

2. **`services/firestoreService.ts`**
   - Added validation to `saveUserData()` (line 17)
   - Added validation to `saveShoppingLists()` (line 75)
   - Added validation to `savePriceHistory()` (line 132)
   - Enforces shopping list limits (20 lists, 100 items/list)
   - Checks price history size limits

3. **`components/AuthModal.tsx`**
   - Added display name validation (line 40)
   - Sanitizes user names before profile update

---

## Security Layers

### Layer 1: Client-Side Validation (TypeScript)
- Validates ALL user input before processing
- Blocks prompt injection attempts
- Enforces length limits and character restrictions
- Location: `src/utils/allowlist.ts`

### Layer 2: Service-Level Protection
- Gemini service validates before API calls
- Firestore service validates before database writes
- Sanitizes AI responses before display
- Locations: `services/geminiService.ts`, `services/firestoreService.ts`

### Layer 3: Server-Side Rules (Firebase)
- Final enforcement at database level
- Blocks unauthorized field modifications
- Prevents privilege escalation
- Location: `firestore.rules` (needs deployment)

---

## Validation Rules

### CRITICAL Risk Inputs

| Input Type | Max Length | Allowed Characters | Purpose |
|------------|------------|-------------------|---------|
| Search Query | 100 | a-z, 0-9, spaces, `-&'().,` | Gemini AI queries |
| Barcode | 8-14 | Digits only | Product identification |

### HIGH Risk Inputs

| Input Type | Max Length | Allowed Characters | Purpose |
|------------|------------|-------------------|---------|
| Item Name | 100 | a-z, 0-9, spaces, `-&'().,` | Shopping list items |
| List Name | 50 | a-z, 0-9, spaces, `-&'().,` | Shopping list titles |
| Display Name | 50 | a-z, 0-9, spaces, `-'`.` | User profiles |
| Price | - | 0.01 - 9999.99 | Price validation |
| Store Name | 100 | a-z, 0-9, spaces, `-&'().,` | Store names |

### System Limits

- **Max shopping lists per user:** 20
- **Max items per list:** 100
- **Max price history entries per product:** 1,000
- **Max Firestore document size:** ~900KB (warning threshold)

---

## Blocked Patterns (Prompt Injection Prevention)

The system blocks these patterns in CRITICAL inputs:
- `ignore previous instructions`
- `disregard all`
- `forget previous`
- `new instructions:`
- `system:`
- `you are now`
- `act as`
- `pretend to be`
- `<script` tags
- `javascript:` protocol
- Event handlers: `onload=`, `onclick=`, etc.
- SQL injection: `DROP TABLE`, `DELETE FROM`, etc.

---

## How to Use

### For Development

```typescript
import { validate, validateBatch } from './src/utils/allowlist';

// Validate single input
const result = validate(userInput, 'searchQuery');
if (!result.valid) {
  throw new Error(result.error);
}

// Validate multiple inputs
const result = validateBatch(itemArray, 'itemName');
if (!result.valid) {
  throw new Error(result.error);
}

// Check limits
const limitCheck = checkShoppingListLimits(currentListCount);
if (!limitCheck.valid) {
  // Handle limit exceeded
}
```

### Validation is Already Active In:

✅ Search queries (App.tsx → geminiService.ts)
✅ Barcode scans (App.tsx → geminiService.ts)
✅ Shopping list items (App.tsx → firestoreService.ts)
✅ List names (ShoppingListView.tsx → firestoreService.ts)
✅ User display names (AuthModal.tsx)
✅ Price history (App.tsx → firestoreService.ts)
✅ AI response outputs (geminiService.ts)

---

## Monthly Review Process

**Schedule:** 1st of every month
**Next Review:** February 1, 2026

### Review Checklist (5-10 minutes)

1. Open `SECURITY_REVIEW.md`
2. Check error logs for validation failures
3. Review any security incidents
4. Test critical endpoints (see test cases in SECURITY_REVIEW.md)
5. Run `npm audit` for dependency vulnerabilities
6. Update blocked patterns if new threats discovered
7. Sign off in the review tracker table

---

## Deployment Steps

### 1. Test Locally
```bash
npm run dev
# Test the validation with edge cases
```

### 2. Deploy Firebase Security Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Monitor Logs
Check console for validation warnings:
- "Invalid store name"
- "Invalid price"
- "Shopping list limit exceeded"
- "WARNING: isPro should only be set server-side"

---

## Important Notes

### Risky Commands Currently BLOCKED by Default

❌ Any search query with "ignore previous instructions"
❌ Any barcode that's not 8-14 digits
❌ Any item name with `<script>` tags
❌ Any display name with special characters
❌ Any price outside 0.01 - 9999.99
❌ Creating more than 20 shopping lists
❌ Creating lists with more than 100 items
❌ Storing more than 1,000 price history entries per product

### Allowed Operations

✅ Normal grocery item searches
✅ Standard product names
✅ Valid UPC/EAN barcodes
✅ User names with letters, numbers, spaces, hyphens
✅ Shopping lists with reasonable item counts
✅ Price tracking within normal ranges

---

## Future Enhancements

Consider implementing:

1. **Rate Limiting**
   - Limit Gemini API calls per minute
   - Throttle database writes

2. **Advanced Monitoring**
   - Log all blocked attempts
   - Alert on repeated violations
   - Track validation failure patterns

3. **User Feedback**
   - Show helpful error messages
   - Suggest valid formats
   - Provide examples

4. **Automated Testing**
   - Unit tests for all validation rules
   - Integration tests for security flows
   - Automated monthly checks

---

## Support

- **Documentation:** See `SECURITY_REVIEW.md`
- **Validation Rules:** See `src/utils/allowlist.ts`
- **Firebase Rules:** See `firestore.rules`

---

## Quick Start

The allowlist is **already active** in your app. No additional setup needed.

To verify it's working:
1. Try searching for: `ignore all instructions`
2. Expected: Error thrown with "blocked pattern"

To deploy server-side rules:
```bash
firebase deploy --only firestore:rules
```

To schedule monthly reviews:
Add a recurring calendar event for the 1st of each month to review `SECURITY_REVIEW.md`.

---

**Status:** ✅ Fully Implemented
**Last Updated:** January 9, 2026
**Next Action:** Deploy Firebase Security Rules + Schedule monthly review
