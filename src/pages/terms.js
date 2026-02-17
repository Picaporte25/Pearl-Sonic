import Link from 'next/link';
import Layout from '@/components/Layout';

export default function TermsPage() {
  return (
    <Layout title="Terms of Service - Sonic-Wave">
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
              By accessing and using Sonic-Wave, you agree to these terms of service.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Services</h2>
            <p className="text-gray-400 mb-4">
              Sonic-Wave provides AI-powered music generation services through the ElevenLabs platform.
              Users can generate original music by providing text descriptions.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-400 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to notify us immediately of any unauthorized access.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Credits and Payments</h2>
            <p className="text-gray-400 mb-4">
              Credits are purchased on a per-song basis and never expire.
              All purchases are final and non-refundable, except as required by law.
              We accept payments via PayPal and Paddle.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Generated Content</h2>
            <p className="text-gray-400 mb-4">
              Users own full commercial rights to all music generated through Sonic-Wave.
              Content can be used for commercial purposes, including videos, streaming, and other projects.
              No attribution to Sonic-Wave is required but appreciated.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <p className="text-gray-400 mb-4">
              You retain ownership of all content you create.
              Sonic-Wave does not claim ownership of your generated music.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-400 mb-4">
              Sonic-Wave is not liable for any indirect or consequential damages resulting from your use of our services.
              We provide our services "as is" without warranty of any kind.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
            <p className="text-gray-400 mb-4">
              We reserve the right to modify these terms at any time.
              Changes will be effective immediately upon posting to the website.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact</h2>
            <p className="text-gray-400 mb-4">
              For questions about these terms, please contact us through our support channels.
            </p>
          </div>

          <div className="border-t border-gray-700 pt-8 mt-8">
            <p className="text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </Layout>
    );
  }
