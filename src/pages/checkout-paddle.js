import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { PADDLE_PRICES_ONETIME, PADDLE_PRICES_MONTHLY, formatPrice } from '@/lib/paddle';

export default function PaddleCheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPaddleReady, setIsPaddleReady] = useState(false);
  const [showSetupMessage, setShowSetupMessage] = useState(true);
  const [billingType, setBillingType] = useState('one-time'); // 'one-time' or 'monthly'

  useEffect(() => {
    fetchUser();
    loadPaddle();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  // Load Paddle SDK dynamically
  const loadPaddle = () => {
    // Check if environment variables are set
    const token = process.env.NEXT_PUBLIC_PADDLE_TOKEN;

    if (!token) {
      setIsPaddleReady(false);
      return;
    }

    // Load Paddle.js
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;

    script.onload = () => {
      // Initialize Paddle
      try {
        window.Paddle.initialize({
          token: token,
          environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox',
        });

        setIsPaddleReady(true);
        setShowSetupMessage(false);
      } catch (err) {
        console.error('Error initializing Paddle:', err);
        setError('Failed to initialize payment system. Please try again later.');
      }
    };

    script.onerror = () => {
      setError('Failed to load payment system. Please refresh the page.');
    };

    document.body.appendChild(script);
  };

  const handleSubscribe = async (priceId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isPaddleReady) {
      alert('Paddle is not configured yet.\n\nTo enable Paddle payments:\n1. Create account at https://www.paddle.com\n2. Get your API token\n3. Create products in the dashboard\n4. Add NEXT_PUBLIC_PADDLE_TOKEN to your .env.local file\n5. Add the actual Price IDs to src/lib/paddle.js');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create checkout session via your API
      const response = await fetch('/api/payment/paddle-create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.match(/token=([^;]+)(;|$)/)?.[1] || ''}`,
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating checkout session');
      }

      // Open Paddle checkout
      window.Paddle.Checkout.open({
        items: [{
          priceId: priceId,
          quantity: 1,
        }],
        customer: {
          email: user.email,
        },
        customData: {
          userId: user.id,
        },
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          successUrl: `${window.location.origin}/checkout-paddle/success`,
          allowLogout: false,
        },
      });

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isPaddleReady) {
    return (
      <Layout title="Buy Credits - Sonic-Wave" user={user} credits={user?.credits || 0}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Processing...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const prices = billingType === 'one-time' ? PADDLE_PRICES_ONETIME : PADDLE_PRICES_MONTHLY;

  return (
    <Layout title="Buy Credits - Sonic-Wave" user={user} credits={user?.credits || 0}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 mb-2">
            Generate AI music at affordable prices. Each song is 2 minutes long.
          </p>
          <p className="text-gray-500">
            Available credits: <span className="text-white font-semibold">{user?.credits || 0}</span>
          </p>
        </div>

        {showSetupMessage && !isPaddleReady && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold mb-1">Paddle Payment Setup Required</p>
                <p className="text-sm">
                  To enable Paddle payments, you need to:
                </p>
                <ol className="text-sm mt-2 ml-4 list-decimal space-y-1">
                  <li>Create account at <a href="https://www.paddle.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">paddle.com</a></li>
                  <li>Create 8 products (4 one-time + 4 monthly) and copy Price IDs</li>
                  <li>Get your API token from Developer settings</li>
                  <li>Add <code className="bg-yellow-500/20 px-1 rounded">NEXT_PUBLIC_PADDLE_TOKEN</code> to .env.local</li>
                  <li>Update Price IDs in <code className="bg-yellow-500/20 px-1 rounded">src/lib/paddle.js</code></li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Billing Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#222] rounded-lg p-1 border border-[#333]">
            <button
              onClick={() => setBillingType('one-time')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingType === 'one-time'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              One-Time Purchase
            </button>
            <button
              onClick={() => setBillingType('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingType === 'monthly'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Subscription
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {prices.map((plan) => (
            <div
              key={plan.id}
              className={`card text-center ${plan.name === 'Pro' ? 'border-purple-500 border-2' : ''}`}
            >
              {plan.name === 'Pro' && (
                <div className="text-purple-500 text-sm font-semibold mb-2">Most popular</div>
              )}
              {plan.billing === 'monthly' && (
                <div className="text-green-500 text-xs font-semibold mb-2">SAVE UP TO 20%</div>
              )}
              <h3 className="text-lg font-semibold text-gray-400 mb-2">{plan.name}</h3>
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                {plan.credits}
              </div>
              <p className="text-gray-500 mb-6">song{plan.credits !== 1 ? 's' : ''}{plan.billing === 'monthly' ? '/month' : ''}</p>
              <div className="text-2xl font-medium text-white mb-6">
                {formatPrice(plan.price)}
                {plan.billing === 'monthly' && <span className="text-sm text-gray-400">/mo</span>}
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
                {loading ? 'Processing...' : plan.billing === 'monthly' ? 'Subscribe' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Subscription Info */}
        {billingType === 'monthly' && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-lg mb-12">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold mb-2">Monthly Subscription Benefits</p>
                <ul className="text-sm space-y-1">
                  <li>• Pay less per month with subscription</li>
                  <li>• Credits added automatically every month</li>
                  <li>• Cancel anytime from your profile</li>
                  <li>• Keep all credits you've earned</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
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
