import Link from 'next/link';
import Layout from '@/components/Layout';

export default function RefundPolicyPage() {
  return (
    <Layout title="Refund Policy - Sonic-Wave">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Refund Policy
          </h1>
        </div>

        <div className="card">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Refund Eligibility</h2>
            <p className="text-gray-400 mb-4">
              Sonic-Wave offers refunds under specific circumstances.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Full Refunds for Failed Generations</p>
                  <p className="text-gray-400 text-sm">
                    If the AI fails to generate music for any technical reason (ElevenLabs API errors, timeouts, etc.), you are entitled to a full refund.
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Contact support within 7 days of the failed generation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">⚠</span>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">No Refunds for Successful Generations</p>
                  <p className="text-gray-400 text-sm">
                    Once music is successfully generated, it cannot be refunded due to the nature of the service.
                  Credits are consumed during generation and cannot be recovered.
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Review your prompt carefully before generating.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">ℹ️</span>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Refunds for Purchased Credits</p>
                  <p className="text-gray-400 text-sm">
                    Credits can be refunded within 7 days of accidental purchase.
                    Technical issues or payment errors that prevent use will be fully refunded.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">How to Request a Refund</h2>
            <p className="text-gray-400 mb-4">
              To request a refund, please contact our support team with your order details.
            </p>

            <div className="space-y-4">
              <div className="card p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Required Information</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Your order number or transaction ID</li>
                  <li>Your email address associated with the account</li>
                  <li>Reason for refund request</li>
                  <li>Date of purchase</li>
                </ul>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Refund Process</h3>
                <ol className="space-y-2 text-gray-400 text-sm">
                  <li>Submit your refund request to our support</li>
                  <li>We will review your request within 48 hours</li>
                  <li>If approved, your refund will be processed within 5-10 business days</li>
                  <li>Refunds are issued to your original payment method</li>
                  <li>You will receive an email confirmation once processed</li>
                </ol>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Non-Refundable Items</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Expired promotional credits</li>
                  <li>Credits used for successfully generated music</li>
                  <li> Account usage fees or processing fees</li>
                  <li> Credits past 90 days of purchase</li>
                </ul>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Contact Information</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Email: <a href="mailto:support@sonicwave.com" className="text-purple-400 hover:text-purple-300">support@sonicwave.com</a>
                </p>
                <p className="text-gray-500 text-sm">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/">
              <button className="btn-primary">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
}
