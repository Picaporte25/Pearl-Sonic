import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import HistoryGallery from '@/components/HistoryGallery';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
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

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/user/history');
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
      <Layout title="History - Sonic-Wave">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="History - Sonic-Wave" user={user} credits={user?.credits || 0}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">Song History</h1>
          <p className="text-gray-400">
            All the songs you've generated are here.
          </p>
        </div>

        <HistoryGallery tracks={tracks} />
      </div>
    </Layout>
  );
}
