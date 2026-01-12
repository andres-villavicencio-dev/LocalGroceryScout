/**
 * Reset Pro Status Script
 * Removes isPro and subscription-related fields from a user document
 *
 * Usage: node scripts/reset-pro-status.js YOUR_USER_ID
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (assumes you have service account key)
// Download from: Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('../path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function resetProStatus(userId) {
  if (!userId) {
    console.error('Error: Please provide a user ID');
    console.log('Usage: node scripts/reset-pro-status.js YOUR_USER_ID');
    process.exit(1);
  }

  try {
    console.log(`Resetting Pro status for user: ${userId}`);

    await db.collection('users').doc(userId).update({
      isPro: admin.firestore.FieldValue.delete(),
      subscriptionId: admin.firestore.FieldValue.delete(),
      stripeCustomerId: admin.firestore.FieldValue.delete(),
      subscriptionStatus: admin.firestore.FieldValue.delete(),
      subscriptionEndDate: admin.firestore.FieldValue.delete(),
      lastVerified: admin.firestore.FieldValue.delete(),
    });

    console.log('✅ Successfully removed Pro status and subscription fields');
    console.log('User is now on Free plan');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting Pro status:', error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];
resetProStatus(userId);
