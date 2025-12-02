
import React, { useState, useMemo } from 'react';
import { ProductHistory } from '../types';

interface PriceHistoryChartProps {
  history: ProductHistory;
  productName: string;
  isDarkMode: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  store: string;
  price: number;
  date: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ history, productName, isDarkMode }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const storeNames = Object.keys(history);

  // Theme colors
  const textColor = isDarkMode ? '#e5e7eb' : '#111827'; // gray-200 vs gray-900
  const subTextColor = isDarkMode ? '#9ca3af' : '#6b7280'; // gray-400 vs gray-500
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb'; // gray-700 vs gray-200
  const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff'; // gray-800 vs white
  const tooltipBorder = isDarkMode ? '#374151' : '#e5e7eb'; // gray-700 vs gray-200
  const tooltipText = isDarkMode ? '#f9fafb' : '#1f2937'; // gray-50 vs gray-800

  // Memoize calculations to get stats
  const stats = useMemo(() => {
    if (storeNames.length === 0) return null;
    // Flatten all history points to calculate aggregate stats
    const allPoints = storeNames.flatMap(store => history[store].map(p => ({ ...p, store })));
    if (allPoints.length < 1) return null;

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
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
        <p className="text-sm text-blue-700 dark:text-blue-300">Start searching for "{productName}" to build a price history graph over time!</p>
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
  // Brighten colors slightly for dark mode if needed, but these standard ones usually work okay.

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative transition-colors">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Price History: {productName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tracking data across {storeNames.length} stores</p>
        </div>
        <div className="flex gap-4 text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-600">
          <div className="text-right px-2 border-r border-gray-200 dark:border-gray-600 last:border-0">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider">Average</p>
            <p className="font-mono font-bold text-gray-800 dark:text-gray-200">${avgPrice.toFixed(2)}</p>
          </div>
          <div className="text-right px-2 border-r border-gray-200 dark:border-gray-600 last:border-0">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider">Median</p>
            <p className="font-mono font-bold text-gray-800 dark:text-gray-200">${medianPrice.toFixed(2)}</p>
          </div>
          <div className="text-right px-2">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider">Best</p>
            <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${dataMin.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="min-w-[500px]">
          {/* Axes Lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={gridColor} strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={gridColor} strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x={padding - 10} y={getY(dataMax)} textAnchor="end" fontSize="10" fill={subTextColor}>${dataMax.toFixed(2)}</text>
          <text x={padding - 10} y={getY(dataMin)} textAnchor="end" fontSize="10" fill={subTextColor}>${dataMin.toFixed(2)}</text>

          {/* Average Line and Label */}
          <text x={padding - 10} y={getY(avgPrice)} textAnchor="end" fontSize="10" fill={subTextColor} alignmentBaseline="middle">Avg</text>
          <line
            x1={padding}
            y1={getY(avgPrice)}
            x2={width - padding}
            y2={getY(avgPrice)}
            stroke={subTextColor}
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
                      <circle cx={cx} cy={cy} r={isMin ? 5 : 3} fill={color} stroke={isDarkMode ? '#1f2937' : 'white'} strokeWidth={isMin ? 2 : 0} />
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
                <path d="M -6 -9 L 0 -1 L 6 -9" fill={tooltipBg} stroke={tooltipBorder} strokeWidth="1" />
                <rect x="-75" y="-76" width="150" height="68" rx="8" fill={tooltipBg} stroke={tooltipBorder} strokeWidth="1" />
                <text x="0" y="-58" textAnchor="middle" fontSize="12" fontWeight="bold" fill={tooltipText}>{tooltip.store}</text>
                <text x="0" y="-42" textAnchor="middle" fontSize="11" fill="#059669" fontWeight="600">${tooltip.price.toFixed(2)}</text>
                <text x="0" y="-26" textAnchor="middle" fontSize="10" fill={subTextColor}>{new Date(tooltip.date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 justify-center border-t border-gray-50 dark:border-gray-700 pt-4">
        {storeNames.map((store, idx) => (
          <div key={store} className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm">
            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors[idx % colors.length] }}></span>
            {store}
          </div>
        ))}
      </div>
    </div>
  );
};
