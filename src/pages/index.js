import Link from 'next/link';
import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);

  return {
    props: {
      user,
      credits: user?.credits || 0,
    },
  };
}

export default function Home({ user, credits }) {
  return (
    <Layout title="Pearl-Sonic - Create Music with AI" user={user} credits={credits}>
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
                "Heavy instrumental Groove Metal with riffs, double bass drums, dark atmospheres, melodic leads. No vocals."
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

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Why Choose Pearl-Sonic?
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Create professional, royalty-free music in seconds with AI technology
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit 1 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">100% Copyright Free</h3>
              <p className="text-sm text-gray-400">
                Use your music in videos, streams, podcasts, and any project without copyright issues
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">Create in Seconds</h3>
              <p className="text-sm text-gray-400">
                Generate original music in just seconds. No waiting, no queues
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">100% Yours Forever</h3>
              <p className="text-sm text-gray-400">
                Every song you create is uniquely yours. Own it forever, no limitations
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Affordable Pricing</h3>
              <p className="text-sm text-gray-400">
                Pay only for what you use. No monthly fees, no subscriptions required
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">Commercial Use Allowed</h3>
              <p className="text-sm text-gray-400">
                Use in YouTube videos, TikTok, Instagram, commercial ads, and more
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">High Quality Audio</h3>
              <p className="text-sm text-gray-400">
                Professional studio quality output. MP3 and WAV formats available
              </p>
            </div>

            {/* Benefit 7 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Unlimited Creativity</h3>
              <p className="text-sm text-gray-400">
                Choose from 40+ genres, custom moods, and any duration you want
              </p>
            </div>

            {/* Benefit 8 */}
            <div className="card text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl border border-white/20 flex items-center justify-center bg-white/5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-pink-400 mb-2">No Attribution Needed</h3>
              <p className="text-sm text-gray-400">
                No need to credit us. Your music, your rules
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Credit Packages
          </h2>
          <p className="text-gray-400 text-center mb-6 max-w-2xl mx-auto">
            Generate AI music at affordable prices. Create songs of any duration you want.
          </p>
          <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
            Songs never expire • Instant generation • Commercial use included
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Package 1 */}
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Starter</h3>
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">2</div>
              <p className="text-gray-500 mb-6">minutes of music</p>
              <div className="text-2xl font-medium text-white mb-6">$5</div>
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
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">6</div>
              <p className="text-gray-500 mb-6">minutes of music</p>
              <div className="text-2xl font-medium text-white mb-6">$15</div>
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
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">10</div>
              <p className="text-gray-500 mb-6">minutes of music</p>
              <div className="text-2xl font-medium text-white mb-6">$25</div>
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
              <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">20</div>
              <p className="text-gray-500 mb-6">minutes of music</p>
              <div className="text-2xl font-medium text-white mb-6">$50</div>
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
            Join Pearl-Sonic today and start creating unique music with AI.
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
