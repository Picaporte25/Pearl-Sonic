import Link from 'next/link';
import Layout from '@/components/Layout';

export default function PrivacyPage() {
  return (
    <Layout title="Privacy Policy - Pearl-Sonic">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </div>

        <div className="card">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-400 mb-4">
              We collect information you provide directly to us, including email address and password for account creation.
            </p>
            <p className="text-gray-400">
              We also collect information about your music generation history, including prompts, generated tracks, and metadata.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-400 mb-4">
              We use your information to provide our AI music generation services, process payments, and maintain your account.
            </p>
            <p className="text-gray-400">
              Your generated content is stored securely and accessible only through your authenticated account.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage and Security</h2>
            <p className="text-gray-400 mb-4">
              All data is stored securely using Supabase infrastructure with industry-standard encryption.
            </p>
            <p className="text-gray-400">
              Your password is encrypted using bcrypt hashing and is never stored in plain text.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Payment Processing</h2>
            <p className="text-gray-400 mb-4">
              Payments are processed securely through Paddle. We do not store your payment card information.
            </p>
            <p className="text-gray-400">
              We only receive confirmation of successful payments and do not have access to your financial data.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies</h2>
            <p className="text-gray-400 mb-4">
              We use cookies to maintain your session and provide a seamless experience.
            </p>
            <p className="text-gray-400">
              Cookies are used for authentication purposes only and do not track your browsing activity across other sites.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Third-Party Services</h2>
            <p className="text-gray-400 mb-4">
              We use third-party services to provide our AI music generation features.
            </p>
            <p className="text-gray-400">
              These services have their own privacy policies which we encourage you to review.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p className="text-gray-400 mb-4">
              You have the right to access, modify, or delete your personal information at any time.
            </p>
            <p className="text-gray-400">
              You can request deletion of your account and all associated data by contacting us.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Us</h2>
            <p className="text-gray-400 mb-4">
              For privacy-related questions or requests, please contact us at:
            </p>
            <p className="text-gray-300 font-medium">
              pearl.sonic25@gmail.com
            </p>
          </div>

          <div className="border-t border-gray-700 pt-8 mt-8">
            <p className="text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
