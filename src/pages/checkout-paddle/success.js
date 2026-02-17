import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function PaddleCheckoutSuccessPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Payment Successful - Sonic-Wave" user={user} credits={user?.credits || 0}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment Successful - Sonic-Wave" user={user} credits={user?.credits || 0}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>

          <p className="text-gray-400 mb-8">
            Your credits have been added to your account. You can now start generating music!
          </p>

          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Credits</p>
                <p className="text-3xl font-bold text-white">{user?.credits || 0}</p>
              </div>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/generate')}
              className="btn-primary py-3 px-8"
            >
              Generate Music
            </button>
            <button
              onClick={() => router.push('/history')}
              className="btn-outline py-3 px-8"
            >
              View History
            </button>
          </div>

          <p className="text-gray-500 text-sm mt-8">
            If you don't see your credits updated within a few minutes, please contact support.
          </p>
        </div>
      </div>
    </Layout>
  );
}
