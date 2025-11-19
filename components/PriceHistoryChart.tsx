import React, { useState, useMemo } from 'react';
import { ProductHistory } from '../types';

interface PriceHistoryChartProps {
  history: ProductHistory;
  productName: string;
}

interface TooltipData {
  x: number;
  y: number;
  store: string;
  price: number;
  date: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ history, productName }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const storeNames = Object.keys(history);

  // Memoize calculations to get stats
  const stats = useMemo(() => {
      if (storeNames.length === 0) return null;
      // Flatten all history points to calculate aggregate stats
      const allPoints = storeNames.flatMap(store => history[store].map(p => ({...p, store})));
      if (allPoints.length < 2) return null;

      const prices = allPoints.map(p => p.price);
      const dates = allPoints.map(p => new Date(p.date).getTime());

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      // Calculate median
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const mid = Math.floor(sortedPrices.length / 2);
      const medianPrice = sortedPrices.length % 2 !== 0 
        ? sortedPrices[mid] 
        : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;

      // Find lowest price point for specific annotation
      const bestDeal = allPoints.reduce((prev, curr) => prev.price < curr.price ? prev : curr);

      return {
          allPoints,
          prices,
          dates,
          minPrice,
          maxPrice,
          avgPrice,
          medianPrice,
          bestDeal
      };
  }, [history, storeNames]);

  if (!stats) {
    return (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
            <p className="text-sm text-blue-700">Start searching for "{productName}" to build a price history graph over time!</p>
        </div>
    );
  }

  const { dates, minPrice: dataMin, maxPrice: dataMax, avgPrice, medianPrice, bestDeal } = stats;

  // Scaling logic with padding to prevent edge cutting
  // Add ~10% padding to top and bottom of price range
  const minPrice = dataMin * 0.9;
  const maxPrice = dataMax * 1.1;
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  
  // If only one date exists (same day), add a fake day buffer for display width
  const dateSpan = maxDate === minDate ? 86400000 : maxDate - minDate;
  const priceSpan = maxPrice === minPrice ? 10 : maxPrice - minPrice;

  const width = 600;
  const height = 280; 
  const padding = 50; 

  const getX = (date: number) => padding + ((date - minDate) / dateSpan) * (width - padding * 2);
  const getY = (price: number) => height - padding - ((price - minPrice) / priceSpan) * (height - padding * 2);

  const colors = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

  return (
    <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
             <h3 className="text-lg font-bold text-gray-900">Price History: {productName}</h3>
             <p className="text-xs text-gray-500">Tracking data across {storeNames.length} stores</p>
          </div>
          <div className="flex gap-4 text-sm bg-gray-50 p-2 rounded-lg border border-gray-100">
              <div className="text-right px-2 border-r border-gray-200 last:border-0">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Average</p>
                  <p className="font-mono font-bold text-gray-800">${avgPrice.toFixed(2)}</p>
              </div>
              <div className="text-right px-2 border-r border-gray-200 last:border-0">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Median</p>
                  <p className="font-mono font-bold text-gray-800">${medianPrice.toFixed(2)}</p>
              </div>
              <div className="text-right px-2">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Best</p>
                  <p className="font-mono font-bold text-emerald-600">${dataMin.toFixed(2)}</p>
              </div>
          </div>
      </div>

      <div className="overflow-x-auto">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="min-w-[500px]">
            {/* Axes Lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Y Axis Labels */}
            <text x={padding - 10} y={getY(dataMax)} textAnchor="end" fontSize="10" fill="#6b7280">${dataMax.toFixed(2)}</text>
            <text x={padding - 10} y={getY(dataMin)} textAnchor="end" fontSize="10" fill="#6b7280">${dataMin.toFixed(2)}</text>
            
            {/* Average Line and Label */}
            <text x={padding - 10} y={getY(avgPrice)} textAnchor="end" fontSize="10" fill="#9ca3af" alignmentBaseline="middle">Avg</text>
            <line 
                x1={padding} 
                y1={getY(avgPrice)} 
                x2={width - padding} 
                y2={getY(avgPrice)} 
                stroke="#9ca3af" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
            />

            {/* Lines and Points */}
            {storeNames.map((store, idx) => {
                const storePoints = history[store]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                const polylinePoints = storePoints
                    .map(p => `${getX(new Date(p.date).getTime())},${getY(p.price)}`)
                    .join(' ');
                
                const color = colors[idx % colors.length];

                return (
                    <g key={store}>
                        <polyline
                            points={polylinePoints}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeOpacity="0.8"
                        />
                        {storePoints.map((p, i) => {
                             const cx = getX(new Date(p.date).getTime());
                             const cy = getY(p.price);
                             const isMin = p.price === dataMin;
                             return (
                               <g key={`${store}-${i}`}>
                                 <circle cx={cx} cy={cy} r={isMin ? 5 : 3} fill={color} stroke="white" strokeWidth={isMin ? 2 : 0} />
                                 {/* Invisible Hit Area for easier hovering */}
                                 <circle
                                   cx={cx}
                                   cy={cy}
                                   r="12"
                                   fill="transparent"
                                   className="cursor-pointer"
                                   onMouseEnter={() => setTooltip({ x: cx, y: cy, store, price: p.price, date: p.date })}
                                   onMouseLeave={() => setTooltip(null)}
                                 />
                               </g>
                             );
                        })}
                    </g>
                );
            })}

            {/* Best Deal Annotation - Pulsing Circle */}
            <g transform={`translate(${getX(new Date(bestDeal.date).getTime())}, ${getY(bestDeal.price)})`}>
                <circle r="8" fill="none" stroke="#10b981" strokeWidth="2" className="animate-pulse" opacity="0.5" />
            </g>

            {/* Tooltip Overlay */}
            {tooltip && (
               <g transform={`translate(${tooltip.x}, ${tooltip.y})`} pointerEvents="none">
                 <g transform="translate(0, -12)">
                    {/* Drop Shadow Filter could go here, but using simplified SVG for compatibility */}
                    <path d="M -6 -9 L 0 -1 L 6 -9" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                    <rect x="-75" y="-76" width="150" height="68" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                     <text x="0" y="-58" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1f2937">{tooltip.store}</text>
                     <text x="0" y="-42" textAnchor="middle" fontSize="11" fill="#059669" fontWeight="600">${tooltip.price.toFixed(2)}</text>
                      <text x="0" y="-26" textAnchor="middle" fontSize="10" fill="#6b7280">{new Date(tooltip.date).toLocaleDateString()}</text>
                 </g>
               </g>
            )}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 justify-center border-t border-gray-50 pt-4">
        {storeNames.map((store, idx) => (
            <div key={store} className="flex items-center text-xs text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: colors[idx % colors.length]}}></span>
                {store}
            </div>
        ))}
      </div>
    </div>
  );
};
