import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Simulate payment verification
    setTimeout(() => {
      setVerified(true);
    }, 1500);
  }, [session_id]);

  return (
    <Layout title="Payment Successful - Sonic-Wave">
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card">
            {verified ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold-300/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                  Payment Successful!
                </h1>

                <p className="text-gray-400 mb-8">
                  Your credits have been added to your account.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/generate')}
                    className="btn-primary w-full"
                  >
                    Generate Music
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="btn-outline w-full"
                  >
                    View Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-6">
                  <div className="spinner" />
                </div>
                <p className="text-gray-400">Verifying your payment...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
