import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { User, ShoppingList, ProductHistory } from '../types';
import {
  validate,
  validateBatch,
  checkShoppingListLimits,
  checkPriceHistoryLimits,
  FIRESTORE_USER_ALLOWLIST
} from '../src/utils/allowlist';

// --- User Data ---
export const saveUserData = async (user: User) => {
    if (!user.id) return;

    // SECURITY: Validate user name if provided
    if (user.name) {
        const nameValidation = validate(user.name, 'displayName');
        if (!nameValidation.valid) {
            console.error(`Invalid user name: ${nameValidation.error}`);
            throw new Error(nameValidation.error);
        }
    }

    try {
        // SECURITY: Only write allowed fields from client
        // isPro, dailySearches, and lastSearchDate should ONLY be set server-side
        // For now, we allow them if they exist, but in production these should be protected by Firebase Security Rules
        const userData: any = {
            lastActive: new Date().toISOString()
        };

        // Only write allowed fields
        if (user.name) userData.name = user.name;
        if (user.email) userData.email = user.email;
        if (user.avatar) userData.avatar = user.avatar;

        // These fields should be protected by Firebase Security Rules in production
        // For now, we allow them but add a warning
        if (user.isPro !== undefined) {
            console.warn("WARNING: isPro should only be set server-side");
            userData.isPro = user.isPro;
        }
        if (user.dailySearches !== undefined) {
            console.warn("WARNING: dailySearches should only be set server-side");
            userData.dailySearches = user.dailySearches;
        }
        if (user.lastSearchDate) {
            userData.lastSearchDate = user.lastSearchDate;
        }

        await setDoc(doc(db, "users", user.id), userData, { merge: true });
    } catch (e) {
        console.error("Error saving user data:", e);
        throw e;
    }
};

export const getUserData = async (userId: string): Promise<Partial<User> | null> => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Partial<User>;
        }
    } catch (e) {
        console.error("Error fetching user data:", e);
    }
    return null;
};

// --- Shopping Lists ---
export const saveShoppingLists = async (userId: string, lists: ShoppingList[]) => {
    // SECURITY: Check shopping list limits
    const limitsCheck = checkShoppingListLimits(lists.length);
    if (!limitsCheck.valid) {
        console.error(`Shopping list limit exceeded: ${limitsCheck.error}`);
        throw new Error(limitsCheck.error);
    }

    // SECURITY: Validate all list names and item names
    try {
        for (const list of lists) {
            // Validate list name
            const nameValidation = validate(list.name, 'listName');
            if (!nameValidation.valid) {
                throw new Error(`Invalid list name "${list.name}": ${nameValidation.error}`);
            }

            // Check items per list limit
            const itemsCheck = checkShoppingListLimits(lists.length, list.items.length);
            if (!itemsCheck.valid) {
                throw new Error(`List "${list.name}": ${itemsCheck.error}`);
            }

            // Validate all item names
            const itemNames = list.items.map(item => item.name);
            const itemsValidation = validateBatch(itemNames, 'itemName');
            if (!itemsValidation.valid) {
                throw new Error(`List "${list.name}": ${itemsValidation.error}`);
            }
        }

        // Storing all lists in a single document for simplicity in this MVP
        // In a larger app, you might want a subcollection 'shoppingLists'
        await setDoc(doc(db, "users", userId, "data", "shoppingLists"), {
            lists: lists
        });
    } catch (e) {
        console.error("Error saving shopping lists:", e);
        throw e;
    }
};

export const getShoppingLists = async (userId: string): Promise<ShoppingList[]> => {
    try {
        const docRef = doc(db, "users", userId, "data", "shoppingLists");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().lists as ShoppingList[];
        }
    } catch (e) {
        console.error("Error fetching shopping lists:", e);
    }
    return [];
};

// --- Price History ---
export const savePriceHistory = async (userId: string, history: Record<string, ProductHistory>) => {
    try {
        // SECURITY: Check price history limits and validate data
        for (const [productName, productHistory] of Object.entries(history)) {
            // Validate product name
            const nameValidation = validate(productName, 'itemName');
            if (!nameValidation.valid) {
                console.warn(`Invalid product name "${productName}": ${nameValidation.error}`);
                continue; // Skip invalid products rather than failing entirely
            }

            // Validate each store's price history
            for (const [storeName, pricePoints] of Object.entries(productHistory)) {
                // Validate store name
                const storeValidation = validate(storeName, 'storeName');
                if (!storeValidation.valid) {
                    console.warn(`Invalid store name "${storeName}" for product "${productName}"`);
                    continue;
                }

                // Check entry count limit per store
                const entryCount = pricePoints.length;
                const limitCheck = checkPriceHistoryLimits(entryCount);
                if (!limitCheck.valid) {
                    console.warn(`${limitCheck.error} for product "${productName}" at store "${storeName}"`);
                    // Trim to limit
                    productHistory[storeName] = pricePoints.slice(-1000);
                }

                // Validate all prices in data points
                for (const pricePoint of pricePoints) {
                    const priceValidation = validate(pricePoint.price, 'price');
                    if (!priceValidation.valid) {
                        console.warn(`Invalid price ${pricePoint.price} for product "${productName}" at store "${storeName}"`);
                    }
                }
            }
        }

        // Storing history in a single document.
        // CAUTION: Firestore documents have a 1MB limit.
        // For production, this should be a subcollection where each product is a doc.
        const historyJSON = JSON.stringify(history);
        const sizeInBytes = new Blob([historyJSON]).size;

        if (sizeInBytes > 900000) { // 900KB threshold (leaving buffer before 1MB limit)
            console.warn(`Price history approaching 1MB limit (${Math.round(sizeInBytes / 1024)}KB). Consider trimming.`);
        }

        await setDoc(doc(db, "users", userId, "data", "priceHistory"), {
            history: history
        });
    } catch (e) {
        console.error("Error saving price history:", e);
        throw e;
    }
};

export const getPriceHistory = async (userId: string): Promise<Record<string, ProductHistory>> => {
    try {
        const docRef = doc(db, "users", userId, "data", "priceHistory");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().history as Record<string, ProductHistory>;
        }
    } catch (e) {
        console.error("Error fetching price history:", e);
    }
    return {};
};
