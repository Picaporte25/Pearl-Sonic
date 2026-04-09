import { useState } from 'react';
import Link from 'next/link';

export default function LyricsGenerator({ user }) {
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(lyrics);
    alert('Lyrics copied to clipboard!');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip: ipAddress } = await ipResponse.json();

      const response = await fetch('/api/lyrics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userId: user?.id,
          ipAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate lyrics');
      }

      setLyrics(data.lyrics);
      setLimitInfo(data.limitInfo);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-medium mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
          Free AI Lyrics Generator
        </h2>
        <p className="text-gray-400">
          Create song lyrics in seconds with AI. No credit card required.
        </p>
        {limitInfo && (
          <div className="mt-4 inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
            <span className="text-purple-300 font-semibold">
              {limitInfo.remaining} / {limitInfo.total} lyrics left today
            </span>
          </div>
        )}
      </div>

      <div className="card p-4 sm:p-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/10">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">
              What should song be about?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: A romantic pop song about meeting someone special at a coffee shop on a rainy Sunday morning. Describe the feeling of instant connection and the conversation that follows."
              className="w-full p-3 sm:p-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none text-sm sm:text-base"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prompt}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Generating...' : 'Generate Lyrics'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
            {error}
            {error.includes('limit') && !user && (
              <Link href="/register" className="block mt-2 text-purple-400 hover:underline">
                Register for 10 free lyrics per day
              </Link>
            )}
            {error.includes('limit') && user && (
              <Link href="/checkout-paddle" className="block mt-2 text-purple-400 hover:underline">
                Upgrade for 100 lyrics per day
              </Link>
            )}
          </div>
        )}

        {lyrics && (
          <div className="card p-4 sm:p-6 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/10 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="text-xl font-bold text-white">AI-Generated Lyrics</h3>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 mb-6">
              <pre className="whitespace-pre-wrap text-gray-300 font-sans text-base leading-relaxed">
                {isExpanded ? lyrics : lyrics.split('\n').slice(0, 10).join('\n') + (lyrics.length > 200 ? '\n\n...' : '')}
              </pre>
            </div>

            <div className="flex items-center justify-between text-sm mb-6 pb-4 border-b border-white/10">
              <span className="text-green-400 font-semibold">100% Original</span>
              <button
                onClick={toggleExpand}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                {isExpanded ? 'See less' : 'See more'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href={`/generate?prompt=${encodeURIComponent(prompt)}&lyrics=${encodeURIComponent(lyrics)}`}>
                <button className="btn-primary flex-1 py-3">
                  Generate Music
                </button>
              </Link>
              <button
                onClick={handleCopy}
                className="btn-outline flex-1 py-3"
              >
                Copy Lyrics
              </button>
            </div>

            {!user && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-center">
                <p className="text-purple-300 mb-3">
                  Love these lyrics? Get more features:
                </p>
                <Link href="/register">
                  <button className="btn-primary py-3">
                    Register for 10 Free Lyrics/Day
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}