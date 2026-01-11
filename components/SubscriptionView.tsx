/**
 * Subscription Management View
 * Shows current subscription status and allows users to manage their subscription
 */

import React, { useState } from 'react';
import { User } from '../types';
import { getFunctions } from 'firebase/functions';
import { createPortalSession, formatSubscriptionStatus, formatSubscriptionDate, getDaysUntilEnd } from '../services/stripeService';

interface SubscriptionViewProps {
  user: User | null;
  onClose: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    // Check if user has a Stripe subscription
    if (!user?.stripeCustomerId) {
      setError('No subscription found. Your Pro status may have been set manually for testing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      // This will redirect to Stripe Customer Portal
      await createPortalSession(functions);
    } catch (err: any) {
      console.error('Failed to open customer portal:', err);
      setError(err.message || 'Failed to open subscription management. Please try again.');
      setIsLoading(false);
    }
  };

  const isPro = user?.isPro || false;
  const status = user?.subscriptionStatus;
  const endDate = user?.subscriptionEndDate;
  const daysUntilEnd = getDaysUntilEnd(endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Subscription</h2>
              <p className="text-emerald-100 text-sm">Manage your Pro membership</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Current Plan */}
          <div className="mb-6">
            <div className={`rounded-xl p-6 ${
              isPro
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-500'
                : 'bg-gray-100 dark:bg-gray-700/30 border-2 border-gray-300 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h3>
                {isPro && (
                  <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                    {formatSubscriptionStatus(status)}
                  </span>
                )}
              </div>

              {isPro ? (
                <>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    $4.99/month
                  </p>
                  {status === 'active' && endDate && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {status === 'canceled' ? 'Expires' : 'Next billing'}: {formatSubscriptionDate(endDate)}
                      {daysUntilEnd !== null && daysUntilEnd > 0 && (
                        <span className="text-gray-500 dark:text-gray-500"> ({daysUntilEnd} days)</span>
                      )}
                    </p>
                  )}
                  {status === 'past_due' && (
                    <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded border border-amber-300 dark:border-amber-700">
                      <p className="text-amber-700 dark:text-amber-400 text-xs">
                        Your payment failed. Please update your payment method to continue enjoying Pro features.
                      </p>
                    </div>
                  )}
                  {status === 'canceled' && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        Your subscription has been cancelled. You'll have access until {formatSubscriptionDate(endDate)}.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-400 mb-1">
                    $0/month
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Limited to 5 searches per day
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Features Comparison */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              {isPro ? 'Your Pro Features' : 'Pro Features'}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className={`w-5 h-5 mr-3 ${isPro ? 'text-emerald-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Unlimited daily searches</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className={`w-5 h-5 mr-3 ${isPro ? 'text-emerald-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Ad-free experience</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className={`w-5 h-5 mr-3 ${isPro ? 'text-emerald-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Advanced price history</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className={`w-5 h-5 mr-3 ${isPro ? 'text-emerald-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Priority support</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isPro ? (
            <div className="space-y-3">
              {!user?.stripeCustomerId && (
                <div className="mb-3 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                  <p className="text-amber-700 dark:text-amber-400 text-xs">
                    <strong>Testing Mode:</strong> Your Pro status was set manually. To manage a real subscription, please upgrade through the app.
                  </p>
                </div>
              )}
              <button
                onClick={handleManageSubscription}
                disabled={isLoading || !user?.stripeCustomerId}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Opening...
                  </>
                ) : (
                  'Manage Subscription'
                )}
              </button>
              {user?.stripeCustomerId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Update payment method, view billing history, or cancel subscription
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Powered by Stripe */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center flex items-center justify-center">
              Secure payments powered by
              <svg className="ml-2 h-4" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 01-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 00-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF" />
              </svg>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
