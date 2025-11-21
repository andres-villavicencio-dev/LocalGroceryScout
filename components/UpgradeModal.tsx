import React from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
                    <div className="text-5xl mb-2">🚀</div>
                    <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
                    <p className="text-emerald-100">Unlock unlimited searches & more!</p>
                </div>

                <div className="p-6">
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
                        onClick={onUpgrade}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-emerald-500/30 mb-3"
                    >
                        Upgrade for $4.99/mo
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium text-sm"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};
