
import React from 'react';
import { SearchResult, ProductHistory, ShoppingList, ShoppingListItem } from '../types';
import { GroundingDisplay } from './GroundingDisplay';
import { PriceHistoryChart } from './PriceHistoryChart';

interface ResultsViewProps {
  result: SearchResult;
  onReset: () => void;
  history?: ProductHistory;
  onAddToList: (itemName: string, price?: number, store?: string) => void;
  lists: ShoppingList[];
  isDarkMode: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onReset,
  history,
  onAddToList,
  lists,
  isDarkMode
}) => {
  const [selectedListId, setSelectedListId] = React.useState(lists.length > 0 ? lists[0].id : '');

  // Find the lowest price info for the quick add button
  const lowestPrice = result.parsedPrices?.sort((a, b) => a.price - b.price)[0];

  // Simple formatting to make the AI text look better
  const formattedText = result.text.split('\n').map((line, i) => {
    const isHeader = line.trim().endsWith(':') || line.trim().startsWith('##') || line.trim().startsWith('**Store');

    if (isHeader) {
      return <h3 key={i} className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mt-4 mb-2">{line.replace(/#/g, '').replace(/\*\*/g, '')}</h3>;
    }

    if (line.trim().startsWith('*') || line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
      const content = line.replace(/^[\*\-\d\.]+\s*/, '');
      const parts = content.split(/(\*\*.*?\*\*)/g);
      return (
        <li key={i} className="ml-4 mb-1 list-disc list-inside text-gray-700 dark:text-gray-300">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-gray-900 dark:text-gray-100">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </li>
      );
    }

    if (line.trim() === '') return <br key={i} />;

    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-gray-900 dark:text-gray-100">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Price Comparison for "{result.productName}"</h2>
          {lowestPrice && (
            <div className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-1">
              Best Deal: ${lowestPrice.price.toFixed(2)} at {lowestPrice.store}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lists.length > 0 && (
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="text-sm border-none focus:ring-0 text-gray-600 dark:text-gray-300 bg-transparent py-1 pl-2 pr-6"
              >
                {lists.map(l => <option key={l.id} value={l.id} className="dark:bg-gray-800">{l.name}</option>)}
              </select>
              <button
                onClick={() => onAddToList(result.productName || "Unknown Item", lowestPrice?.price, lowestPrice?.store)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
              >
                Add to List
              </button>
            </div>
          )}
          <button
            onClick={onReset}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            New Search
          </button>
        </div>
      </div>

      {/* Price History Chart */}
      {history && result.productName && (
        <PriceHistoryChart history={history} productName={result.productName} isDarkMode={isDarkMode} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-emerald-100 dark:border-emerald-900/30 transition-colors">
        <div className="p-6 sm:p-8">
          <div className="prose prose-emerald dark:prose-invert max-w-none">
            {formattedText}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <GroundingDisplay metadata={result.groundingMetadata} />
        </div>
      </div>
    </div>
  );
};
