import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

// Client-side function to get token from cookies
function getTokenFromClient() {
  if (typeof document === 'undefined' || !document.cookie) {
    console.log('Document or cookie not available');
    return null;
  }
  const cookies = document.cookie || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  console.log('Token found:', !!token);
  return token;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getTokenFromClient();

      if (token) {
        console.log('Calling /api/auth/verify...');
        const response = await fetch('/api/auth/verify');

        // Handle empty response
        const text = await response.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }

        console.log('Verify response:', response.status, data);

        if (response.ok && data.user) {
          console.log('User set:', data.user);
          setUser(data.user);
        } else {
          console.log('Verify failed:', response.status, data);
        }
      } else {
        console.log('No token found, user not logged in');
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Sonic-Wave - Create Music with AI" user={user} credits={user?.credits || 0}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sonic-Wave - Create Music with AI" user={user} credits={user?.credits || 0}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Cubo izquierdo - Título y descripción */}
            <div className="text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium mb-6">
                <span className="text-white">
                  Pearl-Sonic
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-400 mb-4">
                Create Music with Artificial Intelligence
              </p>
              <p className="text-lg text-gray-500 max-w-xl mb-10">
                Transform your ideas into original music. Just describe what you want to hear and let AI create something unique for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/generate">
                    <button className="btn-primary text-lg px-8 py-4">
                      Start Creating
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <button className="btn-primary text-lg px-8 py-4">
                        Get Started
                      </button>
                    </Link>
                    <Link href="/login">
                      <button className="btn-primary text-lg px-8 py-4">
                        Sign In
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Cubo derecho - Ejemplo de música */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Example Creation</h3>
              <p className="text-gray-400 mb-2 text-sm">Prompt:</p>
              <p className="text-gray-300 mb-6 italic">
                "Instrumental Groove Metal track, super heavy downtuned guitar riffs, aggressive palm-muted chugs, double bass drums, technical drum fills, dark atmospheric ambient layers in the background, emotional melodic lead guitar sections, cinematic build-ups, powerful breakdowns, high production quality, wide stereo mix, no vocals, intense and immersive mood."
              </p>
              <audio controls className="w-full">
                <source src="/music/Groove metal track.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-16 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">Describe Your Idea</h3>
              <p className="text-gray-400">
                Write a description of music you want to create.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">AI Creates Music</h3>
              <p className="text-gray-400">
                Our artificial intelligence creates a unique song based on your description.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">Download and Use</h3>
              <p className="text-gray-400">
                Listen, download and use your music in any project. It's yours forever!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Song Packages
          </h2>
          <p className="text-gray-400 text-center mb-6 max-w-2xl mx-auto">
            Generate AI music at affordable prices. Each song is 2 minutes long.
          </p>
          <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
            Songs never expire • Instant generation • Commercial use included
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Package 1 */}
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Starter</h3>
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">1</div>
              <p className="text-gray-500 mb-6">song</p>
              <div className="text-2xl font-medium text-white mb-6">$7</div>
              <p className="text-sm text-gray-600 mb-4">2 minutes of music</p>
              {user ? (
                <Link href="/checkout-paddle">
                  <button className="btn-outline w-full">
                    Buy
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="btn-outline w-full">
                    Buy
                  </button>
                </Link>
              )}
            </div>

            {/* Package 2 */}
            <div className="card text-center border-purple-500 border-2">
              <div className="text-purple-500 text-sm font-semibold mb-2">Most popular</div>
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Pro</h3>
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">3</div>
              <p className="text-gray-500 mb-6">songs</p>
              <div className="text-2xl font-medium text-white mb-6">$17</div>
              <p className="text-sm text-gray-600 mb-4">6 minutes of music</p>
              {user ? (
                <Link href="/checkout-paddle">
                  <button className="btn-primary w-full">
                    Buy
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="btn-primary w-full">
                    Buy
                  </button>
                </Link>
              )}
            </div>

            {/* Package 3 */}
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Creator</h3>
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">5</div>
              <p className="text-gray-500 mb-6">songs</p>
              <div className="text-2xl font-medium text-white mb-6">$27</div>
              <p className="text-sm text-gray-600 mb-4">10 minutes of music</p>
              {user ? (
                <Link href="/checkout-paddle">
                  <button className="btn-outline w-full">
                    Buy
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="btn-outline w-full">
                    Buy
                  </button>
                </Link>
              )}
            </div>

            {/* Package 4 */}
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Studio</h3>
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">10</div>
              <p className="text-gray-500 mb-6">songs</p>
              <div className="text-2xl font-medium text-white mb-6">$55</div>
              <p className="text-sm text-gray-600 mb-4">20 minutes of music</p>
              {user ? (
                <Link href="/checkout-paddle">
                  <button className="btn-outline w-full">
                    Buy
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="btn-outline w-full">
                    Buy
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-medium mb-6 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
            Ready to Create Amazing Music?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join Sonic-Wave today and start creating unique music with AI.
          </p>
          <Link href="/register">
            <button className="btn-primary text-lg px-8 py-4">
              Sign Up for Free
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
