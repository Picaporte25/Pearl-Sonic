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
      <Layout title="Profile - Sound-Weaver">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile - Sound-Weaver" user={user} credits={user?.credits || 0}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 gradient-text">My Profile</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border-color">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-gold-300 border-b-2 border-gold-300'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-gold-300 border-b-2 border-gold-300'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Credits Card */}
            <div className="card text-center glow-strong">
              <h2 className="text-lg text-text-secondary mb-2">Available Credits</h2>
              <div className="text-6xl font-bold gradient-text mb-4">{user?.credits || 0}</div>
              <button
                onClick={() => router.push('/checkout')}
                className="btn-gold"
              >
                Buy More Credits
              </button>
            </div>

            {/* Email */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gold-300">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-text-muted text-sm">Email</span>
                  <p className="text-text-primary">{user?.email}</p>
                </div>
                <div>
                  <span className="text-text-muted text-sm">Member since</span>
                  <p className="text-text-primary">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', {
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
                <h3 className="text-xl font-semibold mb-4 text-gold-300">Recent Songs</h3>
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
            <h3 className="text-lg font-semibold mb-4 text-gold-300">Transaction History</h3>

            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div
                    key={t._id}
                    className="flex justify-between items-center py-3 border-b border-border-color last:border-0"
                  >
                    <div>
                      <p className="text-text-primary font-medium">
                        {t.description || (t.type === 'purchase' ? 'Credit purchase' : 'Credit usage')}
                      </p>
                      <p className="text-text-muted text-sm">
                        {new Date(t.createdAt).toLocaleDateString('en-US', {
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
              <p className="text-text-muted text-center py-8">
                No transactions recorded
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
