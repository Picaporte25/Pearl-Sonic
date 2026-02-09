import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

const PACKAGES = [
  { credits: 10, price: 5, label: 'Starter' },
  { credits: 25, price: 10, label: 'Pro', popular: true },
  { credits: 50, price: 18, label: 'Creator' },
  { credits: 100, price: 30, label: 'Studio' },
];

// PayPal pricing (in Argentine Pesos, similar to USD pricing)
const PACKAGES_ARS = [
  { credits: 10, price: 5000, label: 'Starter', displayPrice: 'AR$5.000' },
  { credits: 25, price: 10000, label: 'Pro', popular: true, displayPrice: 'AR$10.000' },
  { credits: 50, price: 18000, label: 'Creator', displayPrice: 'AR$18.000' },
  { credits: 100, price: 30000, label: 'Studio', displayPrice: 'AR$30.000' },
];

// PayPal sandbox app ID
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const NEXT_PUBLIC_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const CREDITS_PER_USD = 5; // 5 USD = 1 credit

export default function CheckoutPage() {
  const router = useRouter();
  const { canceled } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPalScript = () => {
      if (window.paypal) {
        console.log('PayPal SDK already loaded');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=ARS&intent=capture&disable-funding`;
      script.onload = () => {
        console.log('PayPal SDK loaded');
        window.paypal.Buttons().render();
      };
      document.body.appendChild(script);
    };

    loadPayPalScript();

    fetchUser();
  }, [NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_ID]);

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

  const createOrder = async (credits, packageLabel) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/paypal-create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': `Bearer ${document.cookie.match(/token=([^;]+)(;|$)/)?.[1] || ''}`,
        },
        body: JSON.stringify({ credits, packageLabel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating order');
      }

      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize PayPal Buttons
  useEffect(() => {
    if (window.paypal && user && !loading) {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'checkout',
          tagline: false,
        },
        createOrder: (data, actions) => {
          return createOrder(data.credits, data.packageLabel)
            .then((order) => {
              return order.approve();
            })
            .then((order) => {
              // Redirect to PayPal checkout
              return actions.redirect();
            })
            .catch((err) => {
              console.error('PayPal error:', err);
              setError('Error processing payment: ' + err.message);
            });
        },
        onApprove: (data, actions) => {
          setLoading(false);

          // Store order ID for webhook verification
          const orderData = JSON.stringify({
            paypalOrderId: data.id,
            credits: data.credits,
            amount: data.amountArs,
            userId: user.id,
          });
          localStorage.setItem('pendingOrder', orderData);

          // Execute the approved payment
          return actions.order.capture();
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          setError('Payment error: ' + err.message);
        },
      }).render('#paypal-button-container');
    }
  }, [window.paypal, user, loading]);

  return (
    <Layout title="Buy Credits - Sound-Weaver" user={user} credits={user?.credits || 0}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Buy Credits
          </h1>
          <p className="text-text-secondary">
            Available credits: <span className="text-gold-300 font-semibold">{user?.credits || 0}</span>
          </p>
        </div>

        {canceled && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg mb-8 text-center">
            Payment was canceled. You can try again.
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-text-muted text-sm">
            Powered by PayPal • Secure payments
          </p>
        </div>

        {/* Packages */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg, index) => (
            <div
              key={pkg.credits}
              className={`card text-center ${
                pkg.popular ? 'border-gold-dark border-2 glow-strong' : 'glow'
              }`}
            >
              {pkg.popular && (
                <div className="text-gold-300 text-sm font-semibold mb-2">Most popular</div>
              )}
              <h3 className="text-lg font-semibold text-text-secondary mb-2">{pkg.label}</h3>
              <div className="text-4xl font-bold gradient-text mb-2">{pkg.credits}</div>
              <p className="text-text-muted mb-6">credits</p>
              <div className="text-2xl font-bold text-gold-300 mb-6">{pkg.displayPrice}</div>
              <button
                onClick={() => createOrder(pkg.credits, pkg.label)}
                className={pkg.popular ? 'btn-gold w-full' : 'btn-outline-gold w-full'}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Buy'}
              </button>
            </div>
          ))}
        </div>

        {/* PayPal Button Container */}
        <div id="paypal-button-container" className="mt-12" />

        <div className="mt-12 text-center text-text-muted">
          <p>Credits never expire</p>
          <p className="mt-2">Secure payments processed by PayPal</p>
          <p className="text-xs mt-1">Prices shown in Argentine Pesos (ARS)</p>
        </div>
      </div>
    </Layout>
  );
}
