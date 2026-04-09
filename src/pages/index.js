import Link from 'next/link';
import Layout from '@/components/Layout';
import { getUserFromToken } from '@/lib/auth';
import SEOHead from '@/components/SEOHead';
import LyricsGenerator from '@/components/LyricsGenerator';

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
    <>
      <SEOHead
        title="Pearl-Sonic - Create Music with AI"
        description="Create original music with AI using Pearl-Sonic. Generate professional royalty-free songs in seconds with artificial intelligence. Perfect for YouTube, podcasts, and commercial use."
        keywords="AI music generator, create music with AI, artificial intelligence music, free AI music, music generation, AI song creator, royalty free music, copyright-free music, AI music without copyright, content creator music, avoid YouTube copyright strikes, pay-per-use AI music, AI music for YouTube, podcast music generator, AI music for TikTok, Instagram background music, AI music vs Suno, affordable AI music, AI music credits, copyright-free songs, AI music generator no subscription, AI music for social media, commercial use AI music, license-free AI music, Pearl-Sonic"
        canonicalUrl="https://pearl-sonic.vercel.app"
      />
      <Layout title="Pearl-Sonic - Create Music with AI" user={user} credits={credits}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Cubo izquierdo - Título y descripción */}
            <div className="text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Create Studio-Quality Music
                </span>
                <br />
                <span className="text-white">
                  in Seconds
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-300 mb-4">
                No musical skills needed. No expensive studio. Just describe what you want.
              </p>

              <p className="text-lg text-gray-400 max-w-xl mb-10">
                <span className="text-purple-400 font-semibold">100% original.</span> <span className="text-pink-400 font-semibold">100% copyright-free.</span> <span className="text-cyan-400 font-semibold">100% yours forever.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/generate">
                    <button className="btn-primary text-lg px-8 py-4">
                      🎵 Create Your First Song
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <button className="btn-primary text-lg px-8 py-4">
                        🎵 Start Creating Free
                      </button>
                    </Link>
                    <Link href="/generate">
                      <button className="btn-outline text-lg px-8 py-4">
                        Try Demo
                      </button>
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Instant generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Commercial use OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No subscriptions</span>
                </div>
              </div>
            </div>

            {/* Cubo derecho - Ejemplo de música */}
            <div className="card p-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-white">Real AI-Generated Example</h3>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 mb-4">
                <p className="text-gray-400 mb-2 text-sm font-semibold">💬 User Prompt:</p>
                <p className="text-gray-300 italic text-base">
                  "Heavy instrumental Groove Metal with riffs, double bass drums, dark atmospheres, melodic leads. No vocals."
                </p>
              </div>
              <div className="relative">
                <audio controls className="w-full" autoPlay={false}>
                  <source src="/music/Groove metal track.mp3" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-400">⚡ Generated in 12 seconds</span>
                <span className="text-green-400 font-semibold">✓ 100% Original</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Lyrics Generator Section */}
      <section className="py-16 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LyricsGenerator user={user} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to create professional music in under 60 seconds
          </p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-30 -translate-y-1/2"></div>

            {/* Feature 1 */}
            <div className="card text-center relative p-8 border-2 border-purple-500/20 hover:border-purple-500/50 transition-colors">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/30">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Write Your Prompt</h3>
              <p className="text-gray-400 mb-4">
                Describe the music you want in simple English
              </p>
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg p-3 text-left">
                <p className="text-sm text-purple-300 italic">
                  "Epic orchestral soundtrack for movie trailer with dramatic strings and powerful brass"
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card text-center relative p-8 border-2 border-pink-500/20 hover:border-pink-500/50 transition-colors">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center border border-pink-500/30">
                <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Wait 12 Seconds</h3>
              <p className="text-gray-400 mb-4">
                Our AI creates your unique track instantly
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse delay-100"></div>
                <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse delay-200"></div>
              </div>
              <p className="text-sm text-pink-300 mt-2 font-semibold">AI generating...</p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center relative p-8 border-2 border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center border border-cyan-500/30">
                <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Get Your Music</h3>
              <p className="text-gray-400 mb-4">
                Listen, download, and use it anywhere forever
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-cyan-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  MP3
                </div>
                <div className="flex items-center gap-1 text-cyan-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  WAV
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  100% Yours
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            Why Pearl-Sonic?
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            The most powerful AI music generator. Period.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Benefit 1 - Copyright Free */}
            <div className="card text-center p-6 border-2 border-purple-500/20 hover:border-purple-500/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center border border-purple-500/30">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-400 mb-2">100% Copyright Free</h3>
              <p className="text-sm text-gray-400">
                Never worry about copyright strikes. Use anywhere, forever.
              </p>
            </div>

            {/* Benefit 2 - Speed */}
            <div className="card text-center p-6 border-2 border-pink-500/20 hover:border-pink-500/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center border border-pink-500/30">
                <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-pink-400 mb-2">Generate in Seconds</h3>
              <p className="text-sm text-gray-400">
                Studio-quality music in under 30 seconds. No waiting, no queues.
              </p>
            </div>

            {/* Benefit 3 - Commercial Use */}
            <div className="card text-center p-6 border-2 border-cyan-500/20 hover:border-cyan-500/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center border border-cyan-500/30">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-cyan-400 mb-2">Commercial Use OK</h3>
              <p className="text-sm text-gray-400">
                YouTube, TikTok, Instagram, ads. Profit from your content.
              </p>
            </div>

            {/* Benefit 4 - No Subscription */}
            <div className="card text-center p-6 border-2 border-green-500/20 hover:border-green-500/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center border border-green-500/30">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">No Subscriptions</h3>
              <p className="text-sm text-gray-400">
                Pay only for what you use. No monthly fees. No hidden costs.
              </p>
            </div>

            {/* Benefit 5 - High Quality */}
            <div className="card text-center p-6 border-2 border-yellow-500/20 hover:border-yellow-500/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center border border-yellow-500/30">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Studio Quality</h3>
              <p className="text-sm text-gray-400">
                Professional audio output. MP3 + WAV formats. Ready for production.
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
            {[
              { name: 'Starter', credits: 120, price: 5, popular: false },
              { name: 'Pro', credits: 360, price: 15, popular: true },
              { name: 'Creator', credits: 600, price: 25, popular: false },
              { name: 'Studio', credits: 1200, price: 50, popular: false },
            ].map((plan) => (
              <div key={plan.name} className={`card text-center ${plan.popular ? 'border-purple-500 border-2' : ''}`}>
                {plan.popular && (
                  <div className="text-purple-500 text-sm font-semibold mb-2">Most popular</div>
                )}
                <h3 className="text-lg font-semibold text-gray-400 mb-2">{plan.name}</h3>
                <div className="text-4xl font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {plan.credits}
                </div>
                <p className="text-gray-500 mb-6">credits ({Math.floor(plan.credits / 60)}m of audio)</p>
                <div className="text-2xl font-medium text-white mb-6">${plan.price}</div>
                <Link href={user ? '/checkout-paddle' : '/login'}>
                  <button className={`${plan.popular ? 'btn-primary' : 'btn-outline'} w-full`}>
                    Buy
                  </button>
                </Link>
              </div>
            ))}
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
    </>
  );
}
