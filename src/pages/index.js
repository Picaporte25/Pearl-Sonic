import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout title="Sound-Weaver - Create Music with AI">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-[#1C1C1E] to-green-900/10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
                Sound-Weaver
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 mb-4">
              Create Music with Artificial Intelligence
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
              Transform your ideas into original music. Just describe what you want to hear and let AI create something unique for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="btn-gradient text-lg px-8 py-4">
                  Get Started
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-primary text-lg px-8 py-4">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#1C1C1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Describe Your Idea</h3>
              <p className="text-gray-400">
                Write a description of music you want to create. Choose genre, mood and duration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Creates Music</h3>
              <p className="text-gray-400">
                Our artificial intelligence creates a unique song based on your description.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Download and Use</h3>
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
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Credit Packages
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Buy credits and generate all the music you need. Credits never expire.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Package 1 */}
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Starter</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent mb-2">10</div>
              <p className="text-gray-500 mb-6">credits</p>
              <div className="text-2xl font-bold text-white mb-6">$5</div>
              <Link href="/checkout?package=10">
                <button className="btn-outline w-full">
                  Buy
                </button>
              </Link>
            </div>

            {/* Package 2 */}
            <div className="card text-center border-blue-500 border-2">
              <div className="text-blue-500 text-sm font-semibold mb-2">Most popular</div>
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Pro</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent mb-2">25</div>
              <p className="text-gray-500 mb-6">credits</p>
              <div className="text-2xl font-bold text-white mb-6">$10</div>
              <Link href="/checkout?package=25">
                <button className="btn-primary w-full">
                  Buy
                </button>
              </Link>
            </div>

            {/* Package 3 */}
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Creator</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent mb-2">50</div>
              <p className="text-gray-500 mb-6">credits</p>
              <div className="text-2xl font-bold text-white mb-6">$18</div>
              <Link href="/checkout?package=50">
                <button className="btn-outline w-full">
                  Buy
                </button>
              </Link>
            </div>

            {/* Package 4 */}
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Studio</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent mb-2">100</div>
              <p className="text-gray-500 mb-6">credits</p>
              <div className="text-2xl font-bold text-white mb-6">$30</div>
              <Link href="/checkout?package=100">
                <button className="btn-outline w-full">
                  Buy
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1C1C1E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Ready to Create Amazing Music?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join Sound-Weaver today and start creating unique music with AI.
          </p>
          <Link href="/register">
            <button className="btn-gradient text-lg px-8 py-4">
              Sign Up for Free
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
