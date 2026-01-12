/**
 * Cookie Consent Banner
 * Required for GDPR compliance
 */

import React, { useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true, // Always required
  analytics: false,
  advertising: false,
};

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch {
        // Invalid data, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);

    // Reload page to apply preferences (for analytics/ads)
    if (prefs.analytics !== preferences.analytics || prefs.advertising !== preferences.advertising) {
      window.location.reload();
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      advertising: true,
    });
  };

  const acceptEssential = () => {
    savePreferences(DEFAULT_PREFERENCES);
  };

  const saveCustom = () => {
    savePreferences({ ...preferences, essential: true });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 pointer-events-auto animate-slide-up">
        {!showDetails ? (
          // Simple Banner
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Cookie Icon */}
              <div className="flex-shrink-0 text-4xl">
                🍪
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  We Value Your Privacy
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use cookies to enhance your experience, analyze site traffic, and show personalized
                  ads. By clicking "Accept All," you consent to our use of cookies.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read our{' '}
                  <a href="/privacy" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/terms" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline">
                    Terms of Service
                  </a>
                </p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors whitespace-nowrap"
                >
                  Customize
                </button>
                <button
                  onClick={acceptEssential}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors whitespace-nowrap"
                >
                  Essential Only
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Detailed Settings
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🍪</span> Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Essential Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Required for authentication, security, and core functionality. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Always On</p>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help us understand how users interact with our service to improve functionality.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics
                          ? 'bg-emerald-500 justify-end'
                          : 'bg-gray-300 dark:bg-gray-600 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Advertising Cookies */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Advertising Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Used to show personalized ads based on your interests. Pro users don't see ads.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => setPreferences(p => ({ ...p, advertising: !p.advertising }))}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.advertising
                          ? 'bg-emerald-500 justify-end'
                          : 'bg-gray-300 dark:bg-gray-600 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptEssential}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={saveCustom}
                className="flex-1 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                Accept All
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              You can change your preferences at any time in your account settings.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/**
 * Hook to check if user has consented to specific cookie types
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const saved = localStorage.getItem('cookie_consent');
    if (saved) {
      try {
        setConsent(JSON.parse(saved));
      } catch {
        setConsent(DEFAULT_PREFERENCES);
      }
    }
  }, []);

  return consent;
};
