
import React, { useState, useMemo } from 'react';
import { ShoppingList, ShoppingListItem, User } from '../types';
import { BarcodeScanner } from './BarcodeScanner';
import { identifyProductFromBarcode } from '../services/geminiService';

interface ShoppingListViewProps {
  lists: ShoppingList[];
  setLists: (lists: ShoppingList[]) => void;
  onSearchItem: (query: string) => void;
  onScoutList: (items: string[]) => void;
  isScouting: boolean;
  user: User | null;
  onLoginRequest: () => void;
  knownItems?: string[];
}

const SUGGESTED_ITEMS = [
  { name: 'Milk', emoji: '🥛', category: 'Dairy' },
  { name: 'Eggs', emoji: '🥚', category: 'Dairy' },
  { name: 'Bread', emoji: '🍞', category: 'Bakery' },
  { name: 'Bananas', emoji: '🍌', category: 'Produce' },
  { name: 'Avocado', emoji: '🥑', category: 'Produce' },
  { name: 'Chicken', emoji: '🍗', category: 'Meat' },
  { name: 'Rice', emoji: '🍚', category: 'Pantry' },
  { name: 'Pasta', emoji: '🍝', category: 'Pantry' },
  { name: 'Cheese', emoji: '🧀', category: 'Dairy' },
  { name: 'Coffee', emoji: '☕', category: 'Beverages' },
  { name: 'Apples', emoji: '🍎', category: 'Produce' },
  { name: 'Tomatoes', emoji: '🍅', category: 'Produce' },
  { name: 'Onions', emoji: '🧅', category: 'Produce' },
  { name: 'Butter', emoji: '🧈', category: 'Dairy' },
];

const ESSENTIALS_BUNDLE = ['Milk', 'Eggs', 'Bread', 'Bananas'];

type SortOption = 'name-asc' | 'date-desc' | 'date-asc' | 'price-asc' | 'price-desc';

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ lists, setLists, onSearchItem, onScoutList, isScouting, user, onLoginRequest, knownItems }) => {
  const [activeListId, setActiveListId] = useState<string>(lists.length > 0 ? lists[0].id : '');
  const [newItemName, setNewItemName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Ensure we have a valid active list
  const activeList = lists.find(l => l.id === activeListId) || (lists.length > 0 ? lists[0] : undefined);

  // Compute suggestions based on history
  const currentSuggestions = useMemo(() => {
    let bases = [...SUGGESTED_ITEMS];
    
    // If logged in and has history, prioritize those
    if (user && knownItems && knownItems.length > 0) {
        // Filter knownItems to exclude ones already in the suggestion list to avoid duplicates with different emojis
        // or just map them.
        const historySuggestions = knownItems
            .filter(name => name.length < 20) // Filter out very long queries
            .filter(name => !bases.some(b => b.name.toLowerCase() === name.toLowerCase()))
            .map(name => ({ name: name.charAt(0).toUpperCase() + name.slice(1), emoji: '🕒', category: 'Recent' }))
            .slice(0, 6); // Take top 6 recent unique items
        
        return [...historySuggestions, ...bases];
    }
    return bases;
  }, [user, knownItems]);

  const sortedItems = useMemo(() => {
    if (!activeList) return [];
    const items = [...activeList.items];
    switch (sortBy) {
      case 'name-asc':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'date-desc':
        return items.sort((a, b) => b.addedAt - a.addedAt);
      case 'date-asc':
        return items.sort((a, b) => a.addedAt - b.addedAt);
      case 'price-asc':
        return items.sort((a, b) => {
            const pA = a.bestPrice ?? Number.MAX_VALUE;
            const pB = b.bestPrice ?? Number.MAX_VALUE;
            return pA - pB;
        });
      case 'price-desc':
        return items.sort((a, b) => {
            const pA = a.bestPrice ?? -1;
            const pB = b.bestPrice ?? -1;
            return pB - pA;
        });
      default:
        return items;
    }
  }, [activeList, sortBy]);

  const createList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: newListName,
      items: [],
      createdAt: Date.now()
    };
    
    const updated = [...lists, newList];
    setLists(updated);
    setActiveListId(newList.id);
    setNewListName('');
    setIsCreatingList(false);
  };

  const deleteList = (id: string) => {
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    if (activeListId === id && updated.length > 0) {
        setActiveListId(updated[0].id);
    }
  };

  const addItemsToActiveList = (names: string[]) => {
    if (names.length === 0 || !activeList) return;

    const newItems: ShoppingListItem[] = names.map((name, index) => ({
      id: `${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`,
      name: name,
      checked: false,
      addedAt: Date.now() + index // ensure slightly different timestamps
    }));

    const updatedLists = lists.map(list => {
      if (list.id === activeList.id) {
        return { ...list, items: [...list.items, ...newItems] };
      }
      return list;
    });

    setLists(updatedLists);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addItemsToActiveList([newItemName]);
    setNewItemName('');
  };

  const toggleItem = (itemId: string) => {
    if (!activeList) return;
    const updatedLists = lists.map(list => {
      if (list.id === activeList.id) {
        const updatedItems = list.items.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        return { ...list, items: updatedItems };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const removeItem = (itemId: string) => {
    if (!activeList) return;
    const updatedLists = lists.map(list => {
      if (list.id === activeList.id) {
        return { ...list, items: list.items.filter(i => i.id !== itemId) };
      }
      return list;
    });
    setLists(updatedLists);
  };

  const calculateTotal = (list: ShoppingList) => {
    return list.items.reduce((acc, item) => acc + (item.bestPrice || 0), 0);
  };

  const handleBarcodeScan = async (code: string) => {
    setShowScanner(false);
    setNewItemName("Identifying product...");
    try {
        const name = await identifyProductFromBarcode(code);
        setNewItemName(name);
    } catch (e) {
        console.error("Product identification failed", e);
        setNewItemName("");
        alert("Could not identify product from barcode. Please enter name manually.");
    }
  };

  // Empty State
  if (lists.length === 0 && !isCreatingList) {
    return (
      <div className="max-w-4xl mx-auto p-4 w-full flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {user ? `Welcome, ${user.name.split(' ')[0]}!` : 'Start Your Shopping List'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          Create a list to track items and compare prices.
          {!user && " Sign in to save your lists across devices."}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsCreatingList(true)}
            className="bg-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-600 transition-all"
          >
            Create New List
          </button>
          {!user && (
            <button 
              onClick={onLoginRequest}
              className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 px-6 py-3 rounded-full font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Shopping Lists</h2>
            {!user && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center cursor-pointer hover:underline" onClick={onLoginRequest}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Guest Mode: Lists are not saved to account.
                </p>
            )}
        </div>
        <button 
            onClick={() => setIsCreatingList(true)}
            className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center mt-2 sm:mt-0"
        >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            New List
        </button>
      </div>

      {isCreatingList && (
        <form onSubmit={createList} className="mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-2 transition-colors">
            <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List Name (e.g., 'Weekly Groceries')"
                className="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-emerald-500"
                autoFocus
            />
            <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600">Create</button>
            <button type="button" onClick={() => setIsCreatingList(false)} className="text-gray-500 dark:text-gray-400 px-4 py-2">Cancel</button>
        </form>
      )}

      {/* List Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        {lists.map(list => (
            <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    activeList?.id === list.id 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
                {list.name}
            </button>
        ))}
      </div>

      {activeList && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-700/50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeList.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activeList.items.length} items • Est. Total: <span className="text-emerald-600 dark:text-emerald-400 font-bold">${calculateTotal(activeList).toFixed(2)}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => onScoutList(activeList.items.map(i => i.name))}
                        disabled={isScouting || activeList.items.length === 0}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            isScouting 
                                ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 cursor-wait' 
                                : activeList.items.length === 0 
                                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                        }`}
                    >
                        {isScouting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Scouting...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Scout Prices
                            </>
                        )}
                    </button>
                    <button onClick={() => deleteList(activeList.id)} className="text-red-400 hover:text-red-600 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg" title="Delete List">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>

            <div className="p-6">
                <form onSubmit={handleManualAdd} className="mb-6 flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Add item (e.g., Milk, Bread)..."
                            className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Scan Barcode"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        </button>
                    </div>
                    <button type="submit" className="bg-emerald-500 text-white px-6 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                        Add
                    </button>
                </form>

                {/* Quick Add Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Quick Add
                    </h4>
                  </div>
                  
                  {/* Empty List Bundle Call-to-Action */}
                  {activeList.items.length === 0 && (
                    <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg flex items-center justify-between">
                        <div>
                            <h5 className="font-bold text-emerald-800 dark:text-emerald-300">Start with Essentials?</h5>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                Quickly add {ESSENTIALS_BUNDLE.join(', ')} to your list.
                            </p>
                        </div>
                        <button 
                            onClick={() => addItemsToActiveList(ESSENTIALS_BUNDLE)}
                            className="bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 px-4 py-2 rounded-md text-sm font-bold hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors"
                        >
                            Add All
                        </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {currentSuggestions.map(item => (
                      <button
                        key={item.name}
                        onClick={() => addItemsToActiveList([item.name])}
                        className="group flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:border-emerald-400 hover:shadow-sm dark:hover:border-emerald-500 transition-all"
                      >
                        <span className="mr-2">{item.emoji}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {item.name}
                        </span>
                        <span className="ml-1 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">+</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Items</span>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="text-sm border-none bg-transparent text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer font-medium"
                        >
                            <option value="date-desc" className="dark:bg-gray-800">Date: Newest</option>
                            <option value="date-asc" className="dark:bg-gray-800">Date: Oldest</option>
                            <option value="name-asc" className="dark:bg-gray-800">Name: A-Z</option>
                            <option value="price-asc" className="dark:bg-gray-800">Price: Low to High</option>
                            <option value="price-desc" className="dark:bg-gray-800">Price: High to Low</option>
                        </select>
                    </div>
                  </div>
                
                    <div className="space-y-2">
                        {sortedItems.length === 0 ? (
                            <div className="text-center py-8">
                            <p className="text-gray-400 dark:text-gray-500 italic">Your list is empty.</p>
                            </div>
                        ) : (
                            sortedItems.map(item => (
                                <div key={item.id} className="group flex items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-lg hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={item.checked}
                                        onChange={() => toggleItem(item.id)}
                                        className="w-5 h-5 text-emerald-500 rounded border-gray-300 dark:border-gray-600 focus:ring-emerald-500 bg-white dark:bg-gray-700"
                                    />
                                    <div className="ml-3 flex-1">
                                        <span className={`block font-medium ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {item.name}
                                        </span>
                                        {item.bestPrice ? (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                Best: ${item.bestPrice} at {item.bestStore}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">No price data yet</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onSearchItem(item.name)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full mr-1"
                                            title="Search Prices"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </button>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                            title="Remove"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner 
            onScan={handleBarcodeScan} 
            onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};
