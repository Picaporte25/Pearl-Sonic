import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

const PACKAGES = [
  { credits: 1, price: 7, label: 'Starter' },
  { credits: 3, price: 17, label: 'Pro', popular: true },
  { credits: 5, price: 27, label: 'Creator' },
  { credits: 10, price: 55, label: 'Studio' },
];

const PACKAGES_USD = [
  { credits: 1, price: 7, label: 'Starter', displayPrice: '$7.00' },
  { credits: 3, price: 17, label: 'Pro', popular: true, displayPrice: '$17.00' },
  { credits: 5, price: 27, label: 'Creator', displayPrice: '$27.00' },
  { credits: 10, price: 55, label: 'Studio', displayPrice: '$55.00' },
];

export default function Checkout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchUser();
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

  const handleBuy = () => {
    router.push('/checkout-paddle');
  };

  if (!isMounted) {
    return (
      <Layout title="Buy Credits - Pearl-Sonic" user={null} credits={0}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Buy Songs - Pearl-Sonic" user={user} credits={user?.credits || 0}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Buy Songs
          </h1>
          <p className="text-gray-400">
            Available songs: <span className="text-white font-semibold">{user?.credits || 0}</span>
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm">
            Secure payments
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className={`card text-center ${
                pkg.popular ? 'border-purple-500 border-2' : ''
              }`}
            >
              {pkg.popular && (
                <div className="text-white text-sm font-semibold mb-2">Most popular</div>
              )}
              <h3 className="text-lg font-semibold text-gray-400 mb-2">{pkg.label}</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">{pkg.credits}</div>
              <p className="text-gray-500 mb-6">songs</p>
              <p className="text-sm text-gray-600 mb-2">{pkg.credits * 2} minutes of music</p>
              <div className="text-2xl font-bold text-white mb-6">{pkg.displayPrice}</div>
              <button
                onClick={handleBuy}
                className={pkg.popular ? 'btn-primary w-full' : 'btn-outline w-full'}
              >
                Buy
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>Credits never expire</p>
          <p className="text-xs mt-1">Prices shown in US Dollars (USD)</p>
        </div>
      </div>
    </Layout>
  );
}
