import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import MusicGenerator from '@/components/MusicGenerator';
import TrackCard from '@/components/TrackCard';
import { useUser } from '@/contexts/UserContext';

export default function GeneratePage() {
  const router = useRouter();
  const { user, status, updateUser } = useUser();
  const [recentTracks, setRecentTracks] = useState([]);

  useEffect(() => {
    if (status === 'idle') {
      router.push('/login');
    }
    if (status === 'success' && user) {
      fetchRecentTracks();
    }
  }, [status, user, router]);

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
    updateUser({ credits: newCredits });
  };

  if (status === 'loading') {
    return (
      <Layout title="Generate Music - Pearl-Sonic">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="Generate Music - Pearl-Sonic" user={user} credits={user.credits || 0}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Generate Music</h1>
          <p className="text-gray-400">
            Describe what you want to hear and let AI create something unique for you.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <MusicGenerator
              userCredits={user.credits || 0}
              onCreditUpdate={handleCreditUpdate}
            />
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="card sticky top-20">
              <h3 className="text-lg font-semibold mb-4 text-white">Recent Songs</h3>

              {recentTracks.length > 0 ? (
                <div className="space-y-4">
                  {recentTracks.slice(0, 3).map((track) => (
                    <TrackCard key={track.id || track._id} track={track} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No songs yet. Create your first one!
                </p>
              )}

              {recentTracks.length > 0 && (
                <button
                  onClick={() => router.push('/history')}
                  className="btn-outline w-full mt-4 text-sm py-2"
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
