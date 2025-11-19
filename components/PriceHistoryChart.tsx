import React from 'react';
import { ProductHistory } from '../types';

interface PriceHistoryChartProps {
  history: ProductHistory;
  productName: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ history, productName }) => {
  const storeNames = Object.keys(history);
  if (storeNames.length === 0) return null;

  // Flatten all price points to find min/max for scaling
  const allPoints = storeNames.flatMap(store => history[store]);
  if (allPoints.length < 2) {
    return (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
            <p className="text-sm text-blue-700">Start searching for "{productName}" to build a price history graph over time!</p>
        </div>
    );
  }

  const prices = allPoints.map(p => p.price);
  const dates = allPoints.map(p => new Date(p.date).getTime());
  
  const minPrice = Math.min(...prices) * 0.9;
  const maxPrice = Math.max(...prices) * 1.1;
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  
  // If only one date exists (same day), add a fake day buffer for display
  const dateSpan = maxDate === minDate ? 86400000 : maxDate - minDate;
  const priceSpan = maxPrice === minPrice ? 10 : maxPrice - minPrice;

  const width = 600;
  const height = 200;
  const padding = 40;

  const getX = (date: number) => padding + ((date - minDate) / dateSpan) * (width - padding * 2);
  const getY = (price: number) => height - padding - ((price - minPrice) / priceSpan) * (height - padding * 2);

  const colors = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

  return (
    <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Price History Trends: {productName}</h3>
      <div className="overflow-x-auto">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="min-w-[500px]">
            {/* Axes */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Y Axis Labels */}
            <text x={padding - 10} y={getY(maxPrice)} textAnchor="end" fontSize="10" fill="#6b7280">${maxPrice.toFixed(2)}</text>
            <text x={padding - 10} y={getY(minPrice)} textAnchor="end" fontSize="10" fill="#6b7280">${minPrice.toFixed(2)}</text>

            {/* Lines */}
            {storeNames.map((store, idx) => {
                const points = history[store]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(p => `${getX(new Date(p.date).getTime())},${getY(p.price)}`)
                    .join(' ');
                
                return (
                    <g key={store}>
                        <polyline
                            points={points}
                            fill="none"
                            stroke={colors[idx % colors.length]}
                            strokeWidth="2"
                        />
                        {history[store].map((p, i) => (
                             <circle 
                                key={i}
                                cx={getX(new Date(p.date).getTime())}
                                cy={getY(p.price)}
                                r="4"
                                fill={colors[idx % colors.length]}
                                className="hover:r-6 transition-all cursor-pointer"
                             >
                                <title>{store}: ${p.price} ({p.date})</title>
                             </circle>
                        ))}
                    </g>
                );
            })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {storeNames.map((store, idx) => (
            <div key={store} className="flex items-center text-sm text-gray-600">
                <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colors[idx % colors.length]}}></span>
                {store}
            </div>
        ))}
      </div>
    </div>
  );
};
