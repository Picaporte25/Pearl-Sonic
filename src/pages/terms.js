import Link from 'next/link';
import Layout from '@/components/Layout';

export default function TermsPage() {
  return (
    <Layout title="Terms of Service - Pearl-Sonic">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Terms of Service
          </h1>
        </div>

        <div className="card">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-400 mb-4">
              By accessing and using Pearl-Sonic, you agree to these terms of service.
            </p>
            <p className="text-gray-400">
              If you do not agree with these terms, please do not use our service.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Services</h2>
            <p className="text-gray-400 mb-4">
              Pearl-Sonic provides AI-powered music generation services.
            </p>
            <p className="text-gray-400">
              Users can generate original music by providing text descriptions and selecting duration, format, and other options.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-400 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>
            <p className="text-gray-400">
              You agree to notify us immediately of any unauthorized access to your account.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Credits and Payments</h2>
            <p className="text-gray-400 mb-4">
              Credits are purchased on a per-song basis and never expire.
            </p>
            <p className="text-gray-400 mb-4">
              All purchases are final and non-refundable, except as required by law.
            </p>
            <p className="text-gray-400">
              We accept payments securely through Paddle. We do not store your payment information.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Generated Content</h2>
            <p className="text-gray-400 mb-4">
              Users own full commercial rights to all music generated through Pearl-Sonic.
            </p>
            <p className="text-gray-400">
              Content can be used for commercial purposes, including videos, streaming, podcasts, and other projects.
            </p>
            <p className="text-gray-400">
              No attribution to Pearl-Sonic is required but appreciated.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <p className="text-gray-400 mb-4">
              You retain full ownership of all content you create.
            </p>
            <p className="text-gray-400">
              Pearl-Sonic does not claim ownership of your generated music.
            </p>
            <p className="text-gray-400">
              You are responsible for ensuring your use of generated content complies with applicable laws.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-400 mb-4">
              Pearl-Sonic is not liable for any indirect or consequential damages resulting from your use of our services.
            </p>
            <p className="text-gray-400">
              We provide our services "as is" without warranty of any kind, express or implied.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Acceptable Use</h2>
            <p className="text-gray-400 mb-4">
              You agree to use our services only for lawful purposes.
            </p>
            <p className="text-gray-400">
              You may not use our services to generate content that violates laws, infringes on intellectual property, or is harmful.
            </p>
            <p className="text-gray-400">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Terms</h2>
            <p className="text-gray-400 mb-4">
              We reserve the right to modify these terms at any time.
            </p>
            <p className="text-gray-400">
              Changes will be effective immediately upon posting to our website.
            </p>
            <p className="text-gray-400">
              Continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact</h2>
            <p className="text-gray-400 mb-4">
              For questions about these terms, please contact us at:
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
