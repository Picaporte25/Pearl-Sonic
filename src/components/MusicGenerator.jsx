import { useState } from 'react';
import { useRouter } from 'next/router';

export default function MusicGenerator({ userCredits, onCreditUpdate }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(120);
  const [forceInstrumental, setForceInstrumental] = useState(false);
  const [outputFormat, setOutputFormat] = useState('mp3_44100_128');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    const requiredCredits = Math.ceil(duration / 60);
    if (userCredits < requiredCredits) {
      setError('Not enough credits. Please purchase more credits to generate music.');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: duration * 1000, // Convert to milliseconds
          forceInstrumental,
          outputFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError('Not enough credits. Please purchase more credits to generate music.');
          router.push('/checkout');
          return;
        }
        throw new Error(data.error || 'Failed to generate music');
      }

      setSuccess('Music generation started! Check your history for the result.');
      onCreditUpdate(data.remainingCredits);
      setPrompt('');

      // Redirect to history after a short delay
      setTimeout(() => {
        router.push('/history');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to generate music. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6 text-white">Create Your Music</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            Describe your music *
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A calm lo-fi beat with soft piano melodies and rain sounds..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={4}
            disabled={generating}
          />
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
            Duration: {duration} seconds
          </label>
          <input
            type="range"
            id="duration"
            min={10}
            max={600}
            step={10}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            disabled={generating}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10s</span>
            <span>10min</span>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Instrumental Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="instrumental"
              checked={forceInstrumental}
              onChange={(e) => setForceInstrumental(e.target.checked)}
              className="w-5 h-5 bg-gray-800 border-gray-700 rounded text-indigo-500 focus:ring-indigo-500"
              disabled={generating}
            />
            <label htmlFor="instrumental" className="text-sm text-gray-300">
              Instrumental only
            </label>
          </div>

          {/* Output Format */}
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-300 mb-2">
              Format
            </label>
            <select
              id="format"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={generating}
            >
              <option value="mp3_44100_128">MP3 (128kbps)</option>
              <option value="mp3_44100_192">MP3 (192kbps)</option>
              <option value="wav_44100_16">WAV (16-bit)</option>
              <option value="wav_48000_24">WAV (24-bit)</option>
            </select>
          </div>
        </div>

        {/* Cost Display */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-lg px-5 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Duration</p>
              <p className="text-lg font-semibold text-white">
                {duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}min${duration % 60 > 0 ? ` ${duration % 60}s` : ''}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Credits</p>
              <p className={`text-lg font-semibold ${userCredits >= Math.ceil(duration / 60) ? 'text-green-400' : 'text-red-400'}`}>
                {Math.ceil(duration / 60)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Cost (USD)</p>
              <p className="text-lg font-semibold text-indigo-300">
                ${(duration * 0.041666666666666664).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Credits Display */}
        <div className="bg-gray-800/50 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">Credits available:</span>
          <span className={`font-semibold ${userCredits >= Math.ceil(duration / 60) ? 'text-green-400' : 'text-red-400'}`}>
            {userCredits}
          </span>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg px-4 py-3">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={generating || !prompt.trim()}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="spinner-small" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Start Creating</span>
              <span className="text-sm opacity-75">(${(duration * 0.041666666666666664).toFixed(2)} USD - {Math.ceil(duration / 60)} credit{Math.ceil(duration / 60) !== 1 ? 's' : ''})</span>
            </>
          )}
        </button>
      </form>

      {/* Tips */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Tips for better results:</h3>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Be specific about the genre, mood, and instruments</li>
          <li>Describe the tempo (fast, slow, moderate)</li>
          <li>Mention influences or artists you like</li>
          <li>Use instrumental only for background music</li>
        </ul>
      </div>
    </div>
  );
}
