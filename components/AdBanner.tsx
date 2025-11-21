import React from 'react';

interface AdBannerProps {
    isPro?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ isPro }) => {
    if (isPro) return null;

    return (
        <div className="w-full bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-xs uppercase tracking-wider border border-gray-300 dark:border-gray-600 px-1 rounded mr-2">Ad</span>
                    Sponsored: Get 50% off your first grocery delivery with <span className="font-bold text-emerald-600 dark:text-emerald-400">InstaCart</span>!
                </div>
                <button className="text-xs text-gray-400 hover:text-emerald-500 underline">
                    Remove Ads
                </button>
            </div>
        </div>
    );
};
