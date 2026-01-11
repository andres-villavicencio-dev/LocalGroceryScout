
import React, { useState, useEffect, useCallback } from 'react';
import { fetchGroceryPrices, identifyProductFromBarcode, fetchGroceryPricesForList } from './services/geminiService';
import { GeoLocation, SearchResult, AppState, ProductHistory, ShoppingList, ShoppingListItem, User } from './types';
import { ResultsView } from './components/ResultsView';
import { ShoppingListView } from './components/ShoppingListView';
import { BarcodeScanner } from './components/BarcodeScanner';
import { AuthModal } from './components/AuthModal';
import { AdBanner } from './components/AdBanner';
import { UpgradeModal } from './components/UpgradeModal';
import { UpgradeButton, ProBadge } from './components/UpgradeButton';
import { SubscriptionView } from './components/SubscriptionView';
import { auth } from './services/firebase';
import { saveUserData, getUserData, saveShoppingLists, getShoppingLists, savePriceHistory, getPriceHistory } from './services/firestoreService';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [location, setLocation] = useState<GeoLocation | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScouting, setIsScouting] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('grocery_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSubscriptionView, setShowSubscriptionView] = useState(false);

  // Monetization State (Local for guest, synced for user)
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem('grocery_is_pro') === 'true';
  });
  const [dailySearches, setDailySearches] = useState(() => {
    const saved = localStorage.getItem('grocery_daily_searches');
    if (saved) {
      const { count, date } = JSON.parse(saved);
      if (date === new Date().toISOString().split('T')[0]) {
        return count;
      }
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('grocery_is_pro', String(isPro));
  }, [isPro]);

  useEffect(() => {
    const date = new Date().toISOString().split('T')[0];
    localStorage.setItem('grocery_daily_searches', JSON.stringify({ count: dailySearches, date }));
  }, [dailySearches]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('grocery_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle Dark Mode class on html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('grocery_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('grocery_theme', 'light');
    }
  }, [isDarkMode]);

  // Data Persistence - State holders
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, ProductHistory>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Effect: Load data when User changes (Switch profile)
  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '_guest';

    const savedLists = localStorage.getItem(`shoppingLists${userSuffix}`);
    setShoppingLists(savedLists ? JSON.parse(savedLists) : []);

    const savedHistory = localStorage.getItem(`priceHistory${userSuffix}`);
    setPriceHistory(savedHistory ? JSON.parse(savedHistory) : {});
  }, [user]);

  // Effect: Save data when it changes (Debounced slightly by react nature)
  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '_guest';
    localStorage.setItem(`shoppingLists${userSuffix}`, JSON.stringify(shoppingLists));

    // Sync to Firestore if logged in
    // Sync to Firestore if logged in
    if (user && user.id && isDataLoaded) {
      saveShoppingLists(user.id, shoppingLists);
    }
  }, [shoppingLists, user, isDataLoaded]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '_guest';
    localStorage.setItem(`priceHistory${userSuffix}`, JSON.stringify(priceHistory));

    // Sync to Firestore if logged in
    // Sync to Firestore if logged in
    if (user && user.id && isDataLoaded) {
      savePriceHistory(user.id, priceHistory);
    }
  }, [priceHistory, user, isDataLoaded]);

  // Save user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('grocery_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('grocery_user');
    }
  }, [user]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Fetch extended user data from Firestore
        const firestoreUser = await getUserData(firebaseUser.uid);

        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || undefined,
          isPro: firestoreUser?.isPro || isPro, // Prefer Firestore, fallback to local
          dailySearches: firestoreUser?.dailySearches || 0,
          lastSearchDate: firestoreUser?.lastSearchDate || new Date().toISOString().split('T')[0]
        };

        setUser(appUser);
        setIsPro(appUser.isPro || false); // Update local state to match cloud

        // 2. Load Data from Firestore
        const cloudLists = await getShoppingLists(firebaseUser.uid);
        const cloudHistory = await getPriceHistory(firebaseUser.uid);

        if (cloudLists.length > 0) {
          setShoppingLists(cloudLists);
        } else {
          // First time sync? If we have local guest data, maybe we should upload it?
          // For now, let's just keep the local data which will be saved to cloud by the useEffects
          console.log("No cloud lists found, syncing local...");
        }

        if (Object.keys(cloudHistory).length > 0) {
          setPriceHistory(cloudHistory);
        }

        // 3. Save latest profile data
        saveUserData(appUser);

        // Data loading complete
        setIsDataLoaded(true);

      } else {
        setUser(null);
        setIsDataLoaded(true); // Guest mode is "loaded" immediately (from local storage)
        // Reset to guest defaults or keep last known? 
        // Better to clear sensitive info, but maybe keep local guest data if it existed before login?
        // For simplicity, we rely on the 'user' effect to switch back to '_guest' storage key.
      }
    });

    return () => unsubscribe();
  }, []);

  // Request location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      if (state === AppState.IDLE) setState(AppState.LOCATING);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          // ONLY update state if we are still waiting for location. 
          // If user clicked Scan (state=SCANNING) or typed (state=READY/SEARCHING), don't overwrite.
          setState(current => current === AppState.LOCATING ? AppState.READY : current);
        },
        (err) => {
          console.warn("Geolocation denied or failed:", err);
          setState(current => current === AppState.LOCATING ? AppState.READY : current);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      if (state === AppState.IDLE) setState(AppState.READY);
    }
  }, []); // Only run once

  const handleLogin = () => {
    setShowAuthModal(false);
  };

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

  const updatePriceHistory = (productName: string, newData: SearchResult) => {
    if (!newData.parsedPrices || newData.parsedPrices.length === 0) return;

    // Use ISO string with hour precision: YYYY-MM-DDTHH:00
    const now = new Date();
    const currentHourKey = `${now.toISOString().slice(0, 13)}:00`;

    const queryKey = productName.toLowerCase().trim();
    const productKey = newData.productName?.toLowerCase().trim();

    setPriceHistory(prev => {
      const newHistory = { ...prev };

      // Helper to update history for a specific key
      const updateForKey = (key: string, pricePoint: { date: string, price: number, store: string }) => {
        const currentProductHistory = { ...(newHistory[key] || {}) };

        if (!currentProductHistory[pricePoint.store]) {
          currentProductHistory[pricePoint.store] = [];
        } else {
          currentProductHistory[pricePoint.store] = [...currentProductHistory[pricePoint.store]];
        }

        const existingHourIndex = currentProductHistory[pricePoint.store].findIndex(p => p.date === currentHourKey);

        if (existingHourIndex === -1) {
          currentProductHistory[pricePoint.store].push({ date: currentHourKey, price: pricePoint.price });
        } else {
          const newPoints = [...currentProductHistory[pricePoint.store]];
          newPoints[existingHourIndex] = { ...newPoints[existingHourIndex], price: pricePoint.price };
          currentProductHistory[pricePoint.store] = newPoints;
        }
        newHistory[key] = currentProductHistory;
      };

      newData.parsedPrices!.forEach(pp => {
        const point = { date: currentHourKey, price: pp.price, store: pp.store };

        // 1. Save under the search query
        updateForKey(queryKey, point);

        // 2. Save under the specific product name found (if different)
        if (pp.productName) {
          const specificProductKey = pp.productName.toLowerCase().trim();
          if (specificProductKey !== queryKey) {
            updateForKey(specificProductKey, point);
          }
        }
      });

      return newHistory;
    });
  };

  // Automatically update list items if we find a price for them
  const updateListItemsWithPrice = (query: string, data: SearchResult) => {
    if (!data.parsedPrices || data.parsedPrices.length === 0) return;

    // Find the single best price from this search result
    const bestDeal = data.parsedPrices.reduce((min, p) => p.price < min.price ? p : min, data.parsedPrices[0]);

    setShoppingLists(prevLists => prevLists.map(list => ({
      ...list,
      items: list.items.map(item => {
        // Check for case-insensitive match
        if (item.name.trim().toLowerCase() === query.trim().toLowerCase()) {
          return {
            ...item,
            name: bestDeal.productName || item.name,
            bestPrice: bestDeal.price,
            bestStore: bestDeal.store
          };
        }
        return item;
      })
    })));
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // DEBUG: Seed Data
    if (searchQuery.trim() === 'debug:seed') {
      const today = new Date();
      const testProduct = "Test Product";
      const testStore = "Debug Store";
      const history: ProductHistory = {
        [testStore]: Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return {
            date: `${d.toISOString().slice(0, 13)}:00`,
            price: 10 + Math.random() * 5,
            store: testStore
          };
        })
      };

      setPriceHistory(prev => ({
        ...prev,
        [testProduct.toLowerCase()]: history
      }));

      handleAddToList(testProduct, history[testStore][6].price, testStore);
      addToast("Debug data seeded! Check 'Test Product' in your list.", 'success');
      setQuery('');
      return;
    }

    // Check Limits
    if (!isPro && dailySearches >= 5) {
      addToast('Daily search limit reached. Upgrade to Pro for unlimited searches!', 'warning');
      setShowUpgradeModal(true);
      return;
    }

    setDailySearches(prev => prev + 1);
    setQuery(searchQuery);
    setState(AppState.SEARCHING);
    setError(null);
    setResult(null);

    try {
      const data = await fetchGroceryPrices(searchQuery, location);
      setResult(data);
      updatePriceHistory(searchQuery, data);
      updateListItemsWithPrice(searchQuery, data);
      setState(AppState.RESULTS);
    } catch (err: any) {
      const msg = "Failed to fetch prices. Please try again. " + (err.message || "");
      setError(msg);
      addToast(msg, 'error');
      setState(AppState.ERROR);
    }
  };

  const handleScoutList = async (items: string[]) => {
    if (items.length === 0) return;
    setIsScouting(true);

    try {
      const prices = await fetchGroceryPricesForList(items, location);

      if (prices.length > 0) {
        // 1. Update Shopping List Items
        setShoppingLists(prevLists => prevLists.map(list => ({
          ...list,
          items: list.items.map(item => {
            const match = prices.find(p => {
              const query = p.originalQuery?.toLowerCase().trim();
              const itemName = item.name.toLowerCase().trim();
              if (query === itemName) return true;
              if (query && (itemName.includes(query) || query.includes(itemName))) return true;
              if (p.productName?.toLowerCase().includes(itemName)) return true;
              return false;
            });

            if (match) {
              return {
                ...item,
                name: match.productName || item.name,
                bestPrice: match.price,
                bestStore: match.store
              };
            }
            return item;
          })
        })));

        // 2. Update Price History
        const now = new Date();
        const currentHourKey = `${now.toISOString().slice(0, 13)}:00`;

        setPriceHistory(prev => {
          const newHistory = { ...prev };

          // Helper to update history for a specific key
          const updateForKey = (key: string, pricePoint: { date: string, price: number, store: string }) => {
            const currentProductHistory = { ...(newHistory[key] || {}) };

            if (!currentProductHistory[pricePoint.store]) {
              currentProductHistory[pricePoint.store] = [];
            } else {
              currentProductHistory[pricePoint.store] = [...currentProductHistory[pricePoint.store]];
            }

            const existingHourIndex = currentProductHistory[pricePoint.store].findIndex(p => p.date === currentHourKey);

            if (existingHourIndex === -1) {
              currentProductHistory[pricePoint.store].push({ date: currentHourKey, price: pricePoint.price });
            } else {
              const newPoints = [...currentProductHistory[pricePoint.store]];
              newPoints[existingHourIndex] = { ...newPoints[existingHourIndex], price: pricePoint.price };
              currentProductHistory[pricePoint.store] = newPoints;
            }
            newHistory[key] = currentProductHistory;
          };

          prices.forEach(p => {
            // Relaxed check: allow if either originalQuery OR productName is present
            if ((!p.originalQuery && !p.productName) || !p.store || !p.price) return;

            const queryKey = p.originalQuery?.toLowerCase().trim();
            const productKey = p.productName?.toLowerCase().trim();
            const point = { date: currentHourKey, price: p.price, store: p.store };

            if (queryKey) updateForKey(queryKey, point);
            if (productKey && productKey !== queryKey) updateForKey(productKey, point);
          });

          return newHistory;
        });

      } else {
        addToast("No price data found for these items. Try searching for them individually.", 'warning');
      }
    } catch (e: any) {
      console.error("Bulk scout failed", e);
      addToast(`Failed to scout prices: ${e.message || "Unknown error"}`, 'error');
    } finally {
      setIsScouting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleBarcodeScan = async (code: string) => {
    setState(AppState.SEARCHING); // Show loading immediately
    try {
      // First, identify the product
      const identifiedName = await identifyProductFromBarcode(code);
      // Then, search for it
      performSearch(identifiedName);
    } catch (err: any) {
      console.error("Barcode scan failed:", err);
      const msg = err.message || "Could not identify product from barcode. Please try searching by name.";
      setError(msg);
      addToast(msg, 'error');
      setState(AppState.ERROR);
    }
  };

  const handleAddToList = (itemName: string, price?: number, store?: string) => {
    if (shoppingLists.length === 0) {
      const defaultList: ShoppingList = {
        id: Date.now().toString(),
        name: 'My Grocery List',
        items: [],
        createdAt: Date.now()
      };

      const newItem: ShoppingListItem = {
        id: Date.now().toString(),
        name: itemName,
        checked: false,
        addedAt: Date.now(),
        bestPrice: price,
        bestStore: store
      };
      defaultList.items.push(newItem);
      setShoppingLists([defaultList]);
    } else {
      setShoppingLists(prev => {
        const targetList = prev[0];
        const newItem: ShoppingListItem = {
          id: Date.now().toString(),
          name: itemName,
          checked: false,
          addedAt: Date.now(),
          bestPrice: price,
          bestStore: store
        };

        const newLists = [...prev];
        newLists[0] = { ...targetList, items: [...targetList.items, newItem] };
        return newLists;
      });
    }

    addToast(`Added "${itemName}" to ${shoppingLists[0]?.name || 'list'}`, 'success');
  };

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setState(AppState.READY);
  };

  // --- RENDER HELPERS ---

  const renderHero = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8 p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-full inline-block animate-bounce">
        <span className="text-4xl">🛒</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
        Local <span className="text-emerald-600 dark:text-emerald-400">Grocery</span> Scout
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
        Find the best prices, track history, and manage your lists.
        Powered by Gemini 2.5.
      </p>

      <form onSubmit={handleSearch} className="w-full max-w-xl relative z-10">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={location ? "Search 'Eggs'..." : "Search 'Milk in Seattle'..."}
            className="w-full pl-6 pr-24 py-5 text-lg rounded-full border-2 border-emerald-100 dark:border-emerald-800/50 shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            disabled={state === AppState.LOCATING}
          />

          <div className="absolute right-2 top-2 bottom-2 flex gap-1">
            <button
              type="button"
              onClick={() => setState(AppState.SCANNING)}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-full transition-colors z-20 relative pointer-events-auto"
              title="Scan Barcode"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </button>
            <button
              type="submit"
              disabled={state === AppState.LOCATING || !query.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {state === AppState.LOCATING ? (
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={() => setState(AppState.LISTS)}
          className="flex items-center text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <span className="mr-2">📝</span> View Shopping Lists
        </button>

        {/* Free tier info */}
        {!isPro && (
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {dailySearches}/5 free searches today
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium underline"
            >
              Get unlimited searches with Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-emerald-200 dark:border-gray-700 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🔎</div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Scouting Prices...</h2>
      <p className="text-gray-500 dark:text-gray-400 animate-pulse">Analyzing maps, ads, and recent data</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800/50 max-w-md w-full text-center">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Something went wrong</h3>
        <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
        <button
          onClick={handleReset}
          className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-6 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex flex-col transition-colors duration-300">
      <ToastContainer />
      <AdBanner isPro={isPro} />
      {/* Navbar */}
      <nav className="p-4 sm:p-6 flex justify-between items-center max-w-6xl mx-auto w-full z-20">
        <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold text-xl cursor-pointer" onClick={handleReset}>
          <span>🥬</span> <span className="hidden sm:inline">GroceryScout</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {location && (
            <div className="hidden md:flex items-center text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              Location Active
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setState(AppState.LISTS)}
            className={`text-sm font-medium ${state === AppState.LISTS ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
          >
            Lists
          </button>

          {/* Upgrade Button - Show for non-Pro users */}
          {!isPro && (
            <UpgradeButton
              onClick={() => setShowUpgradeModal(true)}
              variant="nav"
            />
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-200 font-bold text-xs overflow-hidden">
                  {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full" /> : user.name[0]}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">{user.name}</span>
                  {isPro && (
                    <button onClick={() => setShowSubscriptionView(true)} className="hidden sm:inline-flex">
                      <ProBadge />
                    </button>
                  )}
                </div>
              </div>
              {isPro && (
                <button
                  onClick={() => setShowSubscriptionView(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                >
                  Manage
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-500 font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col relative">
        {(state === AppState.IDLE || state === AppState.READY || state === AppState.LOCATING) && renderHero()}
        {state === AppState.SEARCHING && renderLoading()}
        {state === AppState.RESULTS && result && (
          <ResultsView
            result={result}
            onReset={handleReset}
            history={priceHistory[result.productName?.toLowerCase() || '']}
            onAddToList={handleAddToList}
            lists={shoppingLists}
            isDarkMode={isDarkMode}
          />
        )}
        {state === AppState.ERROR && renderError()}
        {state === AppState.SCANNING && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setState(AppState.READY)}
          />
        )}
        {state === AppState.LISTS && (
          <ShoppingListView
            lists={shoppingLists}
            setLists={setShoppingLists}
            onSearchItem={performSearch}
            onScoutList={handleScoutList}
            isScouting={isScouting}
            user={user}
            onLoginRequest={() => setShowAuthModal(true)}
            onUpgradeRequest={() => setShowUpgradeModal(true)}
            isPro={isPro}
            knownItems={Object.keys(priceHistory)}
            priceHistory={priceHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 dark:text-gray-600 text-sm border-t border-gray-100 dark:border-gray-800 mt-auto">
        <p>Powered by Google Gemini • Maps & Search Grounding</p>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onLogin={handleLogin}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {showSubscriptionView && (
        <SubscriptionView
          user={user}
          onClose={() => setShowSubscriptionView(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
