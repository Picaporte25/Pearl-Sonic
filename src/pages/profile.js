import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import TrackCard from '@/components/TrackCard';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchTransactions();
        fetchTracks();
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/user/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/user/history?limit=4');
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks || []);
      }
    } catch (err) {
      console.error('Error fetching tracks:', err);
    }
  };

  if (loading) {
    return (
      <Layout title="Profile - Sonic-Wave">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile - Sonic-Wave" user={user} credits={user?.credits || 0}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">My Profile</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#333333]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-gold-300'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-white border-b-2 border-gold-300'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Credits Card */}
            <div className="card text-center">
              <h2 className="text-lg text-gray-400 mb-2">Available Credits</h2>
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-4">{user?.credits || 0}</div>
              <button
                onClick={() => router.push('/checkout-paddle')}
                className="btn-primary"
              >
                Buy More Credits
              </button>
            </div>

            {/* Account Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-white">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Email</span>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Member since</span>
                  <p className="text-white">
                    {new Date(user?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Tracks */}
            {tracks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Recent Songs</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {tracks.map((track) => (
                    <TrackCard key={track._id} track={track} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-white">Transaction History</h3>

            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div
                    key={t._id}
                    className="flex justify-between items-center py-3 border-b border-[#333333] last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {t.description || (t.type === 'purchase' ? 'Credit purchase' : 'Credit usage')}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(t.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        t.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {t.amount > 0 ? '+' : ''}{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No transactions recorded
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
