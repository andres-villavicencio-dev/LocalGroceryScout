
import React, { useState, useEffect, useCallback } from 'react';
import { fetchGroceryPrices, identifyProductFromBarcode } from './services/geminiService';
import { GeoLocation, SearchResult, AppState, ProductHistory, ShoppingList, ShoppingListItem, User } from './types';
import { ResultsView } from './components/ResultsView';
import { ShoppingListView } from './components/ShoppingListView';
import { BarcodeScanner } from './components/BarcodeScanner';
import { AuthModal } from './components/AuthModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [location, setLocation] = useState<GeoLocation | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('grocery_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Data Persistence - State holders
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, ProductHistory>>({});

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
  }, [shoppingLists, user]);

  useEffect(() => {
    const userSuffix = user ? `_${user.id}` : '_guest';
    localStorage.setItem(`priceHistory${userSuffix}`, JSON.stringify(priceHistory));
  }, [priceHistory, user]);

  // Save user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('grocery_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('grocery_user');
    }
  }, [user]);

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
          if (state === AppState.LOCATING) setState(AppState.READY);
        },
        (err) => {
          console.warn("Geolocation denied or failed:", err);
          if (state === AppState.LOCATING) setState(AppState.READY);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      if (state === AppState.IDLE) setState(AppState.READY);
    }
  }, []); // Only run once

  const handleLogin = () => {
    // Mock Login Logic
    const mockUser: User = {
      id: 'google_12345',
      name: 'Demo User',
      email: 'demo.user@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c' // Dummy avatar
    };
    setUser(mockUser);
    setShowAuthModal(false);
    
    // If we were in IDLE/LOCATING, stay there, but if in LISTS, we stay in LISTS
    // If we were guest, we now switch to user data automatically via useEffect
  };

  const handleLogout = () => {
    setUser(null);
    setState(AppState.READY);
    setQuery('');
    setResult(null);
    // Data automatically switches to guest via useEffect
  };

  const updatePriceHistory = (productName: string, newData: SearchResult) => {
    if (!newData.parsedPrices || newData.parsedPrices.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const key = productName.toLowerCase().trim();
    
    setPriceHistory(prev => {
      const productHist = prev[key] || {};
      
      newData.parsedPrices!.forEach(pp => {
        if (!productHist[pp.store]) {
          productHist[pp.store] = [];
        }
        // Check if we already have a price for today to avoid duplicates
        const existingToday = productHist[pp.store].find(p => p.date === today);
        if (!existingToday) {
          productHist[pp.store].push({ date: today, price: pp.price });
        } else {
            existingToday.price = pp.price; // Update if re-searched
        }
      });

      return { ...prev, [key]: productHist };
    });
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setState(AppState.SEARCHING);
    setError(null);
    setResult(null);

    try {
      const data = await fetchGroceryPrices(searchQuery, location);
      setResult(data);
      updatePriceHistory(searchQuery, data);
      setState(AppState.RESULTS);
    } catch (err: any) {
      setError("Failed to fetch prices. Please try again. " + (err.message || ""));
      setState(AppState.ERROR);
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
        setError(err.message || "Could not identify product from barcode. Please try searching by name.");
        setState(AppState.ERROR);
    }
  };

  const handleAddToList = (itemName: string, price?: number, store?: string) => {
    if (shoppingLists.length === 0) {
        // Create default list if none
        const defaultList: ShoppingList = {
            id: Date.now().toString(),
            name: 'My Grocery List',
            items: [],
            createdAt: Date.now()
        };
        setShoppingLists([defaultList]);
        
        // Small hack to ensure we add to the new list immediately, 
        // in a real app we'd wait for state update or use a ref
        const newItem: ShoppingListItem = {
            id: Date.now().toString(),
            name: itemName,
            checked: false,
            addedAt: Date.now(),
            bestPrice: price,
            bestStore: store
        };
        defaultList.items.push(newItem);
        // Update happens via setShoppingLists logic below, but we need to be careful about race conditions with the init above
        // For simplicity in this demo, we'll just update the state directly with the new item included
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
    
    alert(`Added "${itemName}" to ${shoppingLists[0]?.name || 'list'}`);
  };

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setState(AppState.READY);
  };

  // --- RENDER HELPERS ---

  const renderHero = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8 p-4 bg-emerald-100 rounded-full inline-block animate-bounce">
        <span className="text-4xl">🛒</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Local <span className="text-emerald-600">Grocery</span> Scout
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-10">
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
            className="w-full pl-6 pr-24 py-5 text-lg rounded-full border-2 border-emerald-100 shadow-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
            disabled={state === AppState.LOCATING}
          />
          
          <div className="absolute right-2 top-2 bottom-2 flex gap-1">
             <button
                type="button"
                onClick={() => setState(AppState.SCANNING)}
                className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
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
      
      <div className="mt-8 flex gap-4">
        <button 
            onClick={() => setState(AppState.LISTS)}
            className="flex items-center text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-6 py-3 rounded-lg font-medium transition-colors"
        >
            <span className="mr-2">📝</span> View Shopping Lists
        </button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🔎</div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Scouting Prices...</h2>
      <p className="text-gray-500 animate-pulse">Analyzing maps, ads, and recent data</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md w-full text-center">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          onClick={handleReset}
          className="bg-white text-red-600 border border-red-200 px-6 py-2 rounded-full hover:bg-red-50 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col">
      {/* Navbar */}
      <nav className="p-4 sm:p-6 flex justify-between items-center max-w-6xl mx-auto w-full z-20">
        <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xl cursor-pointer" onClick={handleReset}>
           <span>🥬</span> <span className="hidden sm:inline">GroceryScout</span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
            {location && (
            <div className="hidden md:flex items-center text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                Location Active
            </div>
            )}

            <button 
                onClick={() => setState(AppState.LISTS)} 
                className={`text-sm font-medium ${state === AppState.LISTS ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'}`}
            >
                Lists
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full" /> : user.name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.name}</span>
                </div>
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
                className="bg-white text-emerald-600 border border-emerald-200 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-emerald-50 transition-colors"
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
                user={user}
                onLoginRequest={() => setShowAuthModal(true)}
            />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-100 mt-auto">
        <p>Powered by Google Gemini • Maps & Search Grounding</p>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal 
          onLogin={handleLogin} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
};

export default App;
