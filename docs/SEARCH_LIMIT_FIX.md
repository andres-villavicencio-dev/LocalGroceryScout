# Search Limit Fix - Implementation Details

## Problem Summary

The 5 searches/day limit for non-Pro users was not being enforced properly. Users could perform unlimited searches.

## Root Causes Identified

### 1. **No Firestore Sync for Logged-In Users**
- `dailySearches` count incremented locally but never saved to Firestore
- When user refreshed page, search count reset to 0 from Firestore
- Result: Unlimited searches via page refresh

### 2. **No Daily Reset for Logged-In Users**
- When user signed in, app loaded `dailySearches` from Firestore
- No check if that count was from today or yesterday
- Old counts persisted across days
- Result: Users blocked from searching on new day with old counts

### 3. **isPro Defaulting Issue**
- Original code: `isPro: firestoreUser?.isPro || isPro`
- If Firestore returned `undefined`, fell back to local `isPro`
- Local `isPro` could be `true` from testing/caching
- Result: Users incorrectly treated as Pro

### 4. **No Date Validation Before Search**
- Search limit checked `dailySearches >= 5` without verifying date
- If localStorage had old date, counter didn't reset
- Result: Stale data prevented proper daily reset

## Fixes Implemented

### Fix 1: Sync dailySearches to Firestore (App.tsx:56-68)

**Before:**
```typescript
useEffect(() => {
  const date = new Date().toISOString().split('T')[0];
  localStorage.setItem('grocery_daily_searches', JSON.stringify({ count: dailySearches, date }));
}, [dailySearches]);
```

**After:**
```typescript
useEffect(() => {
  const date = new Date().toISOString().split('T')[0];
  localStorage.setItem('grocery_daily_searches', JSON.stringify({ count: dailySearches, date }));

  // Sync to Firestore if user is logged in
  if (user && user.id) {
    saveUserData({
      ...user,
      dailySearches: dailySearches,
      lastSearchDate: date
    });
  }
}, [dailySearches, user]);
```

**Impact:** Search counts now persist to Firestore and survive page refreshes.

---

### Fix 2: Daily Reset on Sign-In (App.tsx:134-151)

**Before:**
```typescript
const appUser: User = {
  id: firebaseUser.uid,
  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  email: firebaseUser.email || '',
  avatar: firebaseUser.photoURL || undefined,
  isPro: firestoreUser?.isPro || isPro, // ❌ Falls back to local isPro
  dailySearches: firestoreUser?.dailySearches || 0, // ❌ No date check
  lastSearchDate: firestoreUser?.lastSearchDate || new Date().toISOString().split('T')[0]
};

setUser(appUser);
setIsPro(appUser.isPro || false);
```

**After:**
```typescript
// Check if we need to reset daily searches (new day)
const today = new Date().toISOString().split('T')[0];
const lastSearchDate = firestoreUser?.lastSearchDate || today;
const shouldResetSearches = lastSearchDate !== today;

const appUser: User = {
  id: firebaseUser.uid,
  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  email: firebaseUser.email || '',
  avatar: firebaseUser.photoURL || undefined,
  isPro: firestoreUser?.isPro || false, // ✅ Default to false
  dailySearches: shouldResetSearches ? 0 : (firestoreUser?.dailySearches || 0), // ✅ Reset if new day
  lastSearchDate: today
};

setUser(appUser);
setIsPro(appUser.isPro || false);
setDailySearches(appUser.dailySearches || 0); // ✅ Sync local state
```

**Impact:**
- Pro status defaults to `false` instead of local cached value
- Daily search count resets at midnight
- Local state synced with Firestore on sign-in

---

### Fix 3: Date Validation Before Each Search (App.tsx:346-368)

**Before:**
```typescript
// Check Limits
if (!isPro && dailySearches >= 5) {
  addToast('Daily search limit reached. Upgrade to Pro for unlimited searches!', 'warning');
  setShowUpgradeModal(true);
  return;
}

setDailySearches(prev => prev + 1);
```

**After:**
```typescript
// Check if we need to reset daily searches (new day)
const today = new Date().toISOString().split('T')[0];
const savedData = localStorage.getItem('grocery_daily_searches');
let currentSearchCount = dailySearches;

if (savedData) {
  const { date } = JSON.parse(savedData);
  if (date !== today) {
    // New day - reset counter
    currentSearchCount = 0;
    setDailySearches(0);
  }
}

// Check Limits - block search if already at 5
if (!isPro && currentSearchCount >= 5) {
  addToast('Daily search limit reached. Upgrade to Pro for unlimited searches!', 'warning');
  setShowUpgradeModal(true);
  return;
}

// Increment counter
setDailySearches(currentSearchCount + 1);
```

**Impact:**
- Daily reset happens even mid-session at midnight
- Uses actual count after date validation
- Prevents race conditions with async state updates

---

### Fix 4: Proper Logout Handling (App.tsx:225-246)

**Before:**
```typescript
const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null);
    setState(AppState.READY);
    setQuery('');
    setResult(null);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
```

**After:**
```typescript
const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null);
    setIsPro(false); // ✅ Reset to free tier for guest mode
    setState(AppState.READY);
    setQuery('');
    setResult(null);

    // ✅ Restore guest's daily search count from localStorage
    const saved = localStorage.getItem('grocery_daily_searches');
    if (saved) {
      const { count, date } = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      setDailySearches(date === today ? count : 0);
    } else {
      setDailySearches(0);
    }
  } catch (error) {
    console.error("Error signing out", error);
  }
};
```

**Impact:**
- Pro users don't leave guest mode as Pro
- Guest search counts properly restored
- Clean slate for guest mode

---

## How Search Limits Work Now

### For Guest Users (Not Signed In)

1. **Counter Storage:** `localStorage` with date
2. **Daily Reset:** Automatic at midnight via date check
3. **Persistence:** Survives page refresh within same day
4. **Limit:** 5 searches per day
5. **Reset Method:** Wait until next day or sign up for Pro

### For Logged-In Free Users

1. **Counter Storage:** `localStorage` + Firestore with date
2. **Daily Reset:** Automatic at midnight via date check (both sign-in and per-search)
3. **Persistence:** Synced to Firestore, survives across devices
4. **Limit:** 5 searches per day
5. **Reset Method:** Wait until next day or upgrade to Pro

### For Pro Users

1. **Counter Storage:** Still tracked but not enforced
2. **Limit:** No limit (unlimited searches)
3. **Check:** `if (!isPro && currentSearchCount >= 5)` - bypassed for Pro users

## Testing the Fix

### Test Case 1: Guest User Search Limit

1. Open app without signing in
2. Perform 5 searches
3. Try 6th search → Should be blocked with upgrade modal
4. Refresh page → Should still be blocked (count persists)
5. Clear localStorage or wait until next day → Counter resets

### Test Case 2: Logged-In Free User Search Limit

1. Sign in as non-Pro user
2. Perform 5 searches
3. Try 6th search → Should be blocked
4. Refresh page → Should still be blocked (Firestore synced)
5. Open in different browser/device → Should still be blocked
6. Wait until next day → Counter resets to 0

### Test Case 3: Pro User Unlimited Searches

1. Sign in as Pro user (with Stripe subscription)
2. Perform 10+ searches → All should succeed
3. No limit enforced

### Test Case 4: Daily Reset at Midnight

1. Sign in as free user at 11:59 PM
2. Perform 5 searches
3. Wait until 12:00 AM (midnight)
4. Perform search → Should succeed (counter reset)

### Test Case 5: Logout Behavior

1. Sign in as Pro user
2. Sign out
3. Verify guest mode is Free (not Pro)
4. Guest search limit should apply

### Test Case 6: Page Refresh

**Before Fix:**
- Refresh page → Counter reset to 0 → Unlimited searches

**After Fix:**
- Refresh page → Counter persists → Limit still enforced

## Verification Commands

### Check User's Search Count in Firestore

```javascript
// In Firebase Console > Firestore
// Navigate to: users/{userId}
// Look for fields:
{
  dailySearches: 3,
  lastSearchDate: "2026-01-12",
  isPro: false
}
```

### Check User's Local Storage

```javascript
// In Browser Console
console.log(JSON.parse(localStorage.getItem('grocery_daily_searches')));
// Output: { count: 3, date: "2026-01-12" }

console.log(localStorage.getItem('grocery_is_pro'));
// Output: "false" or "true"
```

### Manually Reset Search Count (Testing)

```javascript
// In Browser Console
localStorage.setItem('grocery_daily_searches', JSON.stringify({ count: 0, date: new Date().toISOString().split('T')[0] }));
location.reload();
```

### Manually Set Yesterday's Date (Testing Daily Reset)

```javascript
// In Browser Console
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
localStorage.setItem('grocery_daily_searches', JSON.stringify({
  count: 5,
  date: yesterday.toISOString().split('T')[0]
}));
location.reload();
// Next search should succeed (counter resets)
```

## Files Modified

- ✅ `App.tsx` - All search limit logic fixes
- ✅ `docs/SEARCH_LIMIT_FIX.md` - This documentation

## Related Issues Fixed

- ❌ **Before:** Users could bypass limit by refreshing page
- ✅ **After:** Limit persists across refreshes

- ❌ **Before:** Search count didn't reset at midnight for logged-in users
- ✅ **After:** Resets automatically on new day

- ❌ **Before:** Pro users from previous session carried over to guest mode
- ✅ **After:** Clean guest mode after logout

- ❌ **Before:** No Firestore sync for search counts
- ✅ **After:** Search counts synced across devices

## Security Considerations

### Client-Side Enforcement

⚠️ **Current Implementation:** Client-side only
- Search limit checked in browser (App.tsx)
- Can be bypassed by editing localStorage or React state in DevTools
- Not secure against determined attackers

### Recommended: Server-Side Enforcement (Future)

For production, implement backend validation:

```typescript
// functions/src/index.ts
export const searchGroceryPrices = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  const userId = context.auth.uid;
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  // Check Pro status
  if (userData?.isPro) {
    // No limit for Pro users
    return await performSearch(data.query);
  }

  // Check daily limit
  const today = new Date().toISOString().split('T')[0];
  const dailySearches = userData?.lastSearchDate === today ? (userData?.dailySearches || 0) : 0;

  if (dailySearches >= 5) {
    throw new functions.https.HttpsError('resource-exhausted', 'Daily search limit reached');
  }

  // Increment counter
  await db.collection('users').doc(userId).update({
    dailySearches: dailySearches + 1,
    lastSearchDate: today
  });

  return await performSearch(data.query);
});
```

This would require refactoring `fetchGroceryPrices` to call the Cloud Function instead of Gemini directly.

## Conclusion

The search limit is now properly enforced for non-Pro users:
- ✅ Persists across page refreshes
- ✅ Syncs to Firestore for logged-in users
- ✅ Resets daily at midnight
- ✅ Works for both guest and logged-in users
- ✅ Unlimited for Pro users

Users must wait until the next day or upgrade to Pro to continue searching after hitting the limit.
