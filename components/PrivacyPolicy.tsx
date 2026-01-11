/**
 * Privacy Policy Component
 * Required for GDPR compliance and AdSense approval
 */

import React from 'react';

interface PrivacyPolicyProps {
  onClose?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg">
      {onClose && (
        <button
          onClick={onClose}
          className="mb-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back
        </button>
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Privacy Policy
      </h1>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Last Updated: January 11, 2026
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            1. Introduction
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to Local Grocery Scout ("we," "our," or "us"). We respect your privacy and are
            committed to protecting your personal data. This privacy policy explains how we collect,
            use, and protect your information when you use our grocery price comparison service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            2. Information We Collect
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            2.1 Information You Provide
          </h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, and profile picture (if you sign in with Google)</li>
            <li><strong>Payment Information:</strong> Processed securely by Stripe (we do not store your credit card details)</li>
            <li><strong>Shopping Lists:</strong> Items you add to your shopping lists and search queries</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            2.2 Information Automatically Collected
          </h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Location Data:</strong> Approximate location (city/region) to provide local grocery prices</li>
            <li><strong>Usage Data:</strong> Search history, price comparisons, and app interactions</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and IP address</li>
            <li><strong>Cookies:</strong> We use cookies to enhance your experience and show personalized ads</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Provide Services:</strong> Find local grocery prices, manage shopping lists, and track price history</li>
            <li><strong>Process Payments:</strong> Handle Pro subscription payments via Stripe</li>
            <li><strong>Personalization:</strong> Remember your preferences and provide personalized recommendations</li>
            <li><strong>Analytics:</strong> Improve our service and understand user behavior</li>
            <li><strong>Advertising:</strong> Show relevant ads (free tier users) through Google AdSense</li>
            <li><strong>Communication:</strong> Send subscription updates and important service notifications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            4. Third-Party Services
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            We use the following third-party services that may collect your data:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Google Firebase:</strong> Authentication, database, and hosting</li>
            <li><strong>Stripe:</strong> Payment processing (has its own privacy policy)</li>
            <li><strong>Google Gemini AI:</strong> Grocery price search and product identification</li>
            <li><strong>Google AdSense:</strong> Ad serving for free tier users</li>
            <li><strong>Google Maps:</strong> Location services and store information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            5. Cookies and Tracking
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            We use cookies and similar tracking technologies for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Analytics Cookies:</strong> Understand how users interact with our service</li>
            <li><strong>Advertising Cookies:</strong> Show personalized ads (free tier only)</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-3">
            You can manage cookie preferences through our cookie consent banner.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            6. Data Retention
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            We retain your data for as long as your account is active or as needed to provide services.
            You can request deletion of your data at any time by contacting us. After account deletion:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
            <li>Shopping lists and search history are permanently deleted within 30 days</li>
            <li>Account information is removed from our systems within 30 days</li>
            <li>Payment records are retained by Stripe for legal and tax purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            7. Your Rights (GDPR & CCPA)
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-Out:</strong> Withdraw consent for data processing</li>
            <li><strong>Do Not Sell:</strong> We do not sell your personal information</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-3">
            To exercise these rights, contact us at: privacy@localgroceryscout.com
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            8. Data Security
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
            <li>Encryption in transit (HTTPS/TLS)</li>
            <li>Encryption at rest for sensitive data</li>
            <li>Secure authentication via Firebase</li>
            <li>PCI-compliant payment processing via Stripe</li>
            <li>Regular security audits and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            9. Children's Privacy
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our service is not intended for children under 13. We do not knowingly collect personal
            information from children. If you believe we have collected data from a child, please
            contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            10. International Data Transfers
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Your data may be transferred to and processed in countries other than your own. We ensure
            appropriate safeguards are in place to protect your data in compliance with GDPR and other
            applicable regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            11. Changes to This Policy
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            We may update this privacy policy from time to time. We will notify you of significant
            changes via email or a prominent notice in our app. Your continued use of our service
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            12. Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have questions about this privacy policy or our data practices:
          </p>
          <div className="mt-3 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> privacy@localgroceryscout.com</p>
            <p><strong>Address:</strong> [Your Business Address]</p>
          </div>
        </section>
      </div>
    </div>
  );
};
