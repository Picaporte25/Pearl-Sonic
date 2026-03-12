import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';
import { PADDLE_PRICES_ONETIME, formatPrice } from '@/lib/paddle';

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
      credits: user.credits || 0,
    },
  };
}

export default function PaddleCheckoutPage({ user: serverUser, credits: serverCredits }) {
  const router = useRouter();
  const [user] = useState(serverUser);
  const [credits] = useState(serverCredits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (priceId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    console.log('=== FRONTEND: Starting checkout process ===');
    console.log('User:', user?.id, user?.email);
    console.log('Price ID:', priceId);

    try {
      // Create transaction via API
      const response = await fetch('/api/payment/paddle-create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Paddle hosted checkout
      window.location.href = data.checkoutUrl;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prices = PADDLE_PRICES_ONETIME;

  return (
    <Layout title="Buy Credits - Sonic-Wave" user={user} credits={user?.credits || 0}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 mb-2">
            Generate AI music at affordable prices. Create songs of any duration you want.
          </p>
          <p className="text-gray-500">
            Available credits: <span className="text-white font-semibold">{credits}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {prices.map((plan) => (
            <div
              key={plan.id}
              className={`card text-center ${plan.name === 'Pro' ? 'border-purple-500 border-2' : ''}`}
            >
              {plan.name === 'Pro' && (
                <div className="text-purple-500 text-sm font-semibold mb-2">Most popular</div>
              )}
              <h3 className="text-lg font-semibold text-gray-400 mb-2">{plan.name}</h3>
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                {plan.credits * 2}
              </div>
              <p className="text-gray-500 mb-6">minutes of music</p>
              <div className="text-2xl font-medium text-white mb-6">
                {formatPrice(plan.price)}
              </div>
              <p className="text-sm text-gray-600 mb-6">{plan.credits * 2} minutes of music</p>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || !user}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  loading || !user
                    ? 'opacity-50 cursor-not-allowed bg-gray-600 text-gray-300'
                    : plan.name === 'Pro'
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                {loading ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="card inline-block p-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Why Choose Sonic-Wave?</h3>
            <div className="text-gray-400 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Full Commercial Rights</p>
                  <p className="text-sm text-gray-500">Use your music for YouTube, TikTok, videos, and any commercial project.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Credits Never Expire</p>
                  <p className="text-sm text-gray-500">Buy only what you need. Your credits stay in your account forever.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">High Quality Audio</p>
                  <p className="text-sm text-gray-500">Professional studio quality output every time.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Secure Payments</p>
                  <p className="text-sm text-gray-500">Powered by Paddle - global payment processing with full security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
