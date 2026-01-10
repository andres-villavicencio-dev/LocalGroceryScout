import React, { useState } from 'react';
import { getFunctions } from 'firebase/functions';
import { createCheckoutSession } from '../services/stripeService';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const functions = getFunctions();
            // This will redirect to Stripe Checkout
            await createCheckoutSession(functions);
            // No need to handle success here - user will be redirected to Stripe
        } catch (err: any) {
            console.error('Failed to create checkout session:', err);
            setError(err.message || 'Failed to start checkout. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
                    <div className="text-5xl mb-2">🚀</div>
                    <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
                    <p className="text-emerald-100">Unlock unlimited searches & more!</p>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Unlimited Daily Searches
                        </li>
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Ad-Free Experience
                        </li>
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Advanced Price History Charts
                        </li>
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-emerald-500/30 mb-3 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            'Upgrade for $4.99/mo'
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Maybe Later
                    </button>

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
                        Secure payment powered by Stripe
                    </p>
                </div>
            </div>
        </div>
    );
};
