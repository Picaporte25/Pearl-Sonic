import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import MusicGenerator from '@/components/MusicGenerator';
import TrackCard from '@/components/TrackCard';

export default function GeneratePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTracks, setRecentTracks] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchRecentTracks();
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTracks = async () => {
    try {
      const response = await fetch('/api/user/history?limit=3');
      if (response.ok) {
        const data = await response.json();
        setRecentTracks(data.tracks || []);
      }
    } catch (err) {
      console.error('Error fetching recent tracks:', err);
    }
  };

  const handleCreditUpdate = (newCredits) => {
    setUser((prev) => ({ ...prev, credits: newCredits }));
  };

  if (loading) {
    return (
      <Layout title="Generate Music - Sound-Weaver">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Generate Music - Sound-Weaver" user={user} credits={user?.credits || 0}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Generate Music</h1>
          <p className="text-text-secondary">
            Describe what you want to hear and let AI create something unique for you.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Generator */}
          <div className="lg:col-span-2">
            <MusicGenerator
              userCredits={user?.credits || 0}
              onCreditUpdate={handleCreditUpdate}
            />
          </div>

          {/* Sidebar - Recent Tracks */}
          <div className="mt-8 lg:mt-0">
            <div className="card sticky top-4">
              <h3 className="text-xl font-semibold mb-4 text-gold-300">Recent Songs</h3>

              {recentTracks.length > 0 ? (
                <div className="space-y-4">
                  {recentTracks.slice(0, 3).map((track) => (
                    <TrackCard key={track._id} track={track} />
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm">
                  You haven't generated any songs yet. Start now!
                </p>
              )}

              {recentTracks.length > 0 && (
                <button
                  onClick={() => router.push('/history')}
                  className="btn-outline-gold w-full mt-4 text-sm py-2"
                >
                  View All History
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
