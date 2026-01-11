/**
 * Terms of Service Component
 * Legal agreement between users and Local Grocery Scout
 */

import React from 'react';

interface TermsOfServiceProps {
  onClose?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
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
        Terms of Service
      </h1>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Last Updated: January 11, 2026
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            By accessing or using Local Grocery Scout ("the Service"), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            2. Description of Service
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Local Grocery Scout provides grocery price comparison, shopping list management, and price
            history tracking services using AI-powered search technology.
          </p>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            2.1 Service Tiers
          </h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Free Tier:</strong> Limited to 5 searches per day, includes advertisements</li>
            <li><strong>Pro Tier:</strong> $4.99/month - Unlimited searches, ad-free experience, advanced features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            3. User Accounts
          </h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            3.1 Account Registration
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            To use certain features, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activities under your account</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mt-4 mb-2">
            3.2 Account Termination
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            We reserve the right to suspend or terminate accounts that violate these terms or engage
            in fraudulent, abusive, or illegal activities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            4. Pro Subscription
          </h2>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            4.1 Billing and Payment
          </h3>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Monthly Subscription:</strong> $4.99 per month, billed automatically</li>
            <li><strong>Payment Processing:</strong> Securely processed by Stripe</li>
            <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
            <li><strong>Failed Payments:</strong> Service may be suspended if payment fails</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            4.2 Cancellation
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            You may cancel your Pro subscription at any time:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Cancel through your account settings or Stripe Customer Portal</li>
            <li>Access remains until the end of your current billing period</li>
            <li>No partial refunds for unused time within a billing period</li>
            <li>You can resubscribe at any time</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
            4.3 Refund Policy
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            We offer refunds within 7 days of initial purchase if you're unsatisfied with the service.
            To request a refund, contact us at support@localgroceryscout.com. Refunds are processed
            within 5-10 business days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            5. Acceptable Use
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            You agree NOT to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to circumvent search limits or subscription requirements</li>
            <li>Scrape, harvest, or collect data from our service</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Impersonate others or misrepresent your affiliation</li>
            <li>Use automated systems (bots) without permission</li>
            <li>Share your account credentials with others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            6. Price Information Disclaimer
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Important:</strong> Price information is provided for comparison purposes only and
            may not be current or accurate. We aggregate prices from various sources including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
            <li>Store websites and weekly ads</li>
            <li>Third-party pricing databases</li>
            <li>AI-generated estimates based on available data</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-3">
            <strong>We do not guarantee:</strong> Price accuracy, product availability, or that prices
            remain constant. Always verify prices at the store before purchasing. We are not
            responsible for pricing errors or discrepancies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            7. Intellectual Property
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            All content, features, and functionality of the Service are owned by Local Grocery Scout
            and are protected by copyright, trademark, and other intellectual property laws. You may
            not copy, modify, distribute, or create derivative works without our permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            8. Disclaimer of Warranties
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
            EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
            <li>The service will be uninterrupted or error-free</li>
            <li>Price information will be accurate or up-to-date</li>
            <li>Defects will be corrected</li>
            <li>The service is free of viruses or harmful components</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            9. Limitation of Liability
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOCAL GROCERY SCOUT SHALL NOT BE LIABLE FOR:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
            <li>Indirect, incidental, special, or consequential damages</li>
            <li>Loss of profits, data, or business opportunities</li>
            <li>Damages resulting from price inaccuracies</li>
            <li>Damages exceeding the amount you paid in the last 12 months</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            10. Indemnification
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            You agree to indemnify and hold harmless Local Grocery Scout from any claims, damages,
            losses, or expenses arising from your use of the service or violation of these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            11. Third-Party Services
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Our service integrates with third-party services (Google, Stripe, Firebase). Your use of
            these services is subject to their respective terms and privacy policies. We are not
            responsible for third-party services or content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            12. Modifications to Service and Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            We reserve the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
            <li>Modify or discontinue the service at any time</li>
            <li>Update these terms with or without notice</li>
            <li>Change pricing with 30 days notice for existing subscribers</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-3">
            Continued use after changes constitutes acceptance of modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            13. Governing Law
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            These terms are governed by the laws of [Your State/Country], without regard to conflict
            of law provisions. Any disputes shall be resolved in the courts of [Your Jurisdiction].
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            14. Contact Information
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            For questions about these Terms of Service:
          </p>
          <div className="mt-3 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> support@localgroceryscout.com</p>
            <p><strong>Address:</strong> [Your Business Address]</p>
          </div>
        </section>

        <section className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            By using Local Grocery Scout, you acknowledge that you have read, understood, and agree
            to be bound by these Terms of Service.
          </p>
        </section>
      </div>
    </div>
  );
};
