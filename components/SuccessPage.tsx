/**
 * Payment Success Page
 * Shown when user successfully completes payment in Stripe Checkout
 */

import React, { useEffect, useState } from 'react';

interface SuccessPageProps {
  onContinue: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ onContinue }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect after 5 seconds
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Pro! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your payment was successful. You now have unlimited searches and an ad-free experience!
          </p>

          {/* Benefits List */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-6">
            <ul className="text-left space-y-2">
              <li className="flex items-center text-emerald-700 dark:text-emerald-400">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Unlimited daily searches activated
              </li>
              <li className="flex items-center text-emerald-700 dark:text-emerald-400">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ad-free experience enabled
              </li>
              <li className="flex items-center text-emerald-700 dark:text-emerald-400">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Advanced features unlocked
              </li>
            </ul>
          </div>

          {/* Auto-redirect Notice */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Redirecting to app in {countdown} seconds...
          </p>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105"
          >
            Continue to App
          </button>

          {/* Receipt Notice */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            A receipt has been sent to your email address
          </p>
        </div>
      </div>
    </div>
  );
};
