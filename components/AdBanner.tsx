import React, { useEffect, useRef } from 'react';
import { useCookieConsent } from './CookieConsent';

interface AdBannerProps {
    isPro?: boolean;
    onUpgradeClick?: () => void;
}

// AdSense configuration
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';
const ADSENSE_SLOT_ID = import.meta.env.VITE_ADSENSE_SLOT_ID || '';

export const AdBanner: React.FC<AdBannerProps> = ({ isPro, onUpgradeClick }) => {
    const adRef = useRef<HTMLDivElement>(null);
    const consent = useCookieConsent();

    // Don't show ads to Pro users
    if (isPro) return null;

    // Check if AdSense is configured
    const hasAdSense = ADSENSE_CLIENT_ID && ADSENSE_SLOT_ID;

    useEffect(() => {
        // Only load AdSense if:
        // 1. AdSense is configured
        // 2. User has consented to advertising cookies
        // 3. Ad container exists
        if (hasAdSense && consent.advertising && adRef.current) {
            try {
                // Load AdSense script if not already loaded
                if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
                    const script = document.createElement('script');
                    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
                    script.async = true;
                    script.crossOrigin = 'anonymous';
                    document.head.appendChild(script);
                }

                // Initialize ad after a short delay
                setTimeout(() => {
                    try {
                        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                    } catch (error) {
                        console.error('AdSense initialization error:', error);
                    }
                }, 100);
            } catch (error) {
                console.error('AdSense loading error:', error);
            }
        }
    }, [hasAdSense, consent.advertising]);

    // Show real AdSense ad if configured and user consented
    if (hasAdSense && consent.advertising) {
        return (
            <div className="w-full bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 flex items-center justify-between">
                        <span className="uppercase tracking-wider">Advertisement</span>
                        {onUpgradeClick && (
                            <button
                                onClick={onUpgradeClick}
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline"
                            >
                                Remove Ads with Pro
                            </button>
                        )}
                    </div>
                    <div ref={adRef} className="text-center">
                        <ins
                            className="adsbygoogle"
                            style={{ display: 'block' }}
                            data-ad-client={ADSENSE_CLIENT_ID}
                            data-ad-slot={ADSENSE_SLOT_ID}
                            data-ad-format="horizontal"
                            data-full-width-responsive="true"
                        ></ins>
                    </div>
                </div>
            </div>
        );
    }

    // Show cookie consent message if user hasn't consented
    if (!consent.advertising) {
        return (
            <div className="w-full bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        To see personalized ads and support free access, please enable advertising cookies in your{' '}
                        <button className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                            privacy settings
                        </button>
                        .
                    </p>
                    {onUpgradeClick && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Or{' '}
                            <button
                                onClick={onUpgradeClick}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                            >
                                upgrade to Pro
                            </button>
                            {' '}for an ad-free experience.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Fallback: Show mock ad when AdSense is not configured
    return (
        <div className="w-full bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-xs uppercase tracking-wider border border-gray-300 dark:border-gray-600 px-1 rounded mr-2">
                        Ad
                    </span>
                    Sponsored: Get 50% off your first grocery delivery with{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">InstaCart</span>!
                </div>
                {onUpgradeClick && (
                    <button
                        onClick={onUpgradeClick}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 underline"
                    >
                        Remove Ads with Pro
                    </button>
                )}
            </div>
        </div>
    );
};
