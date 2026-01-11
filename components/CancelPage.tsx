/**
 * Payment Cancelled Page
 * Shown when user cancels Stripe Checkout
 */

import React, { useEffect, useState } from 'react';

interface CancelPageProps {
  onContinue: () => void;
  onTryAgain: () => void;
}

export const CancelPage: React.FC<CancelPageProps> = ({ onContinue, onTryAgain }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="relative mb-6">
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No worries! Your payment was cancelled and you haven't been charged.
          </p>

          {/* Why Upgrade Section */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              You're missing out on:
            </h3>
            <ul className="text-left space-y-2">
              <li className="flex items-start text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Unlimited searches per day (you're limited to 5)</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Ad-free, distraction-free experience</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Advanced price tracking features</span>
              </li>
            </ul>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-3">
              Just $4.99/month
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onTryAgain}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105"
            >
              Try Again
            </button>

            <button
              onClick={onContinue}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Continue with Free Plan
            </button>
          </div>

          {/* Auto-redirect Notice */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Returning to app in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};
