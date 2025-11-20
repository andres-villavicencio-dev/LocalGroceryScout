
import React from 'react';
import { GroundingMetadata, GroundingChunk } from '../types';

interface GroundingDisplayProps {
  metadata?: GroundingMetadata;
}

export const GroundingDisplay: React.FC<GroundingDisplayProps> = ({ metadata }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  const { groundingChunks } = metadata;

  // Separate map and web chunks for cleaner display
  const mapChunks = groundingChunks.filter((c: GroundingChunk) => c.maps);
  const webChunks = groundingChunks.filter((c: GroundingChunk) => c.web);

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Sources & Locations
      </h3>

      {/* Google Maps Sources */}
      {mapChunks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Nearby Stores
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mapChunks.map((chunk, idx) => (
              <a
                key={`map-${idx}`}
                href={chunk.maps?.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200 bg-white dark:bg-gray-800 shadow-sm group"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {chunk.maps?.title || "Unknown Location"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View on Maps</p>
                </div>
                <div className="ml-2 text-gray-400 group-hover:text-emerald-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Web Search Sources */}
      {webChunks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 3 13.09 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Web Sources
          </h4>
          <ul className="space-y-2">
            {webChunks.map((chunk, idx) => (
              <li key={`web-${idx}`}>
                <a
                  href={chunk.web?.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {chunk.web?.title || chunk.web?.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
