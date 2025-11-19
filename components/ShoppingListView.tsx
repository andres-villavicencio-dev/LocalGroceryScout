
import React, { useState } from 'react';
import { ShoppingList, ShoppingListItem, User } from '../types';

interface ShoppingListViewProps {
  lists: ShoppingList[];
  setLists: (lists: ShoppingList[]) => void;
  onSearchItem: (query: string) => void;
  user: User | null;
  onLoginRequest: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ lists, setLists, onSearchItem, user, onLoginRequest }) => {
  const [activeListId, setActiveListId] = useState<string>(lists.length > 0 ? lists[0].id : '');
  const [newItemName, setNewItemName] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Ensure we have a valid active list
  const activeList = lists.find(l => l.id === activeListId) || (lists.length > 0 ? lists[0] : undefined);

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

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeList) return;

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: newItemName,
      checked: false,
      addedAt: Date.now()
    };

    const updatedLists = lists.map(list => {
      if (list.id === activeList.id) {
        return { ...list, items: [...list.items, newItem] };
      }
      return list;
    });

    setLists(updatedLists);
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

  // Empty State
  if (lists.length === 0 && !isCreatingList) {
    return (
      <div className="max-w-4xl mx-auto p-4 w-full flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {user ? `Welcome, ${user.name.split(' ')[0]}!` : 'Start Your Shopping List'}
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm">
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
              className="bg-white text-emerald-600 border border-emerald-200 px-6 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-all"
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
            <h2 className="text-2xl font-bold text-gray-900">My Shopping Lists</h2>
            {!user && (
                <p className="text-xs text-amber-600 mt-1 flex items-center cursor-pointer hover:underline" onClick={onLoginRequest}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Guest Mode: Lists are not saved to account.
                </p>
            )}
        </div>
        <button 
            onClick={() => setIsCreatingList(true)}
            className="text-sm text-emerald-600 font-medium hover:text-emerald-800 flex items-center mt-2 sm:mt-0"
        >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            New List
        </button>
      </div>

      {isCreatingList && (
        <form onSubmit={createList} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-2">
            <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List Name (e.g., 'Weekly Groceries')"
                className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-emerald-500"
                autoFocus
            />
            <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600">Create</button>
            <button type="button" onClick={() => setIsCreatingList(false)} className="text-gray-500 px-4 py-2">Cancel</button>
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
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
                {list.name}
            </button>
        ))}
      </div>

      {activeList && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{activeList.name}</h3>
                    <p className="text-sm text-gray-500">
                        {activeList.items.length} items • Est. Total: <span className="text-emerald-600 font-bold">${calculateTotal(activeList).toFixed(2)}</span>
                    </p>
                </div>
                <button onClick={() => deleteList(activeList.id)} className="text-red-400 hover:text-red-600 p-2" title="Delete List">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <div className="p-6">
                <form onSubmit={addItem} className="mb-6 flex gap-2">
                    <input 
                        type="text" 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Add item (e.g., Milk, Bread)..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <button type="submit" className="bg-emerald-500 text-white px-6 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                        Add
                    </button>
                </form>

                <div className="space-y-2">
                    {activeList.items.length === 0 ? (
                        <p className="text-center text-gray-400 py-8 italic">Your list is empty. Add items above!</p>
                    ) : (
                        activeList.items.map(item => (
                            <div key={item.id} className="group flex items-center bg-white border border-gray-100 p-3 rounded-lg hover:border-emerald-200 hover:shadow-sm transition-all">
                                <input 
                                    type="checkbox" 
                                    checked={item.checked}
                                    onChange={() => toggleItem(item.id)}
                                    className="w-5 h-5 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500"
                                />
                                <div className="ml-3 flex-1">
                                    <span className={`block font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {item.name}
                                    </span>
                                    {item.bestPrice ? (
                                        <span className="text-xs text-emerald-600 font-medium">
                                            Best: ${item.bestPrice} at {item.bestStore}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">No price data yet</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onSearchItem(item.name)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full mr-1"
                                        title="Search Prices"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
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
      )}
    </div>
  );
};
