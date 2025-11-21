import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { User, ShoppingList, ProductHistory } from '../types';

// --- User Data ---
export const saveUserData = async (user: User) => {
    if (!user.id) return;
    try {
        await setDoc(doc(db, "users", user.id), {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isPro: user.isPro,
            dailySearches: user.dailySearches,
            lastSearchDate: user.lastSearchDate,
            lastActive: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.error("Error saving user data:", e);
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
    try {
        // Storing all lists in a single document for simplicity in this MVP
        // In a larger app, you might want a subcollection 'shoppingLists'
        await setDoc(doc(db, "users", userId, "data", "shoppingLists"), {
            lists: lists
        });
    } catch (e) {
        console.error("Error saving shopping lists:", e);
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
        // Storing history in a single document. 
        // CAUTION: Firestore documents have a 1MB limit. 
        // For production, this should be a subcollection where each product is a doc.
        await setDoc(doc(db, "users", userId, "data", "priceHistory"), {
            history: history
        });
    } catch (e) {
        console.error("Error saving price history:", e);
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
