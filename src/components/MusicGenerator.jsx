import { useState } from 'react';
import { useRouter } from 'next/router';

const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Blues', 'Classical',
  'Country', 'Reggae', 'Funk', 'Soul', 'Metal', 'Punk', 'Folk', 'Disco',
  'House', 'Techno', 'Trance', 'Ambient', 'Chillout', 'Lo-Fi', 'Trap', 'Dubstep',
  'Drum & Bass', 'Reggaeton', 'Salsa', 'Bachata', 'Merengue', 'K-Pop',
  'Indie', 'Alternative', 'Synthwave', 'Gospel', 'Opera', 'Orchestral', 'Soundtrack',
  'Downtempo', 'Trip-Hop', 'Breakbeat', 'Hardstyle', 'Progressive'
];

const MOODS = [
  { value: 'happy', label: 'Happy & Uplifting' },
  { value: 'sad', label: 'Sad & Emotional' },
  { value: 'energetic', label: 'Energetic & Powerful' },
  { value: 'calm', label: 'Calm & Relaxing' },
  { value: 'dark', label: 'Dark & Intense' },
  { value: 'romantic', label: 'Romantic & Soft' },
  { value: 'mysterious', label: 'Mysterious & Atmospheric' },
  { value: 'epic', label: 'Epic & Cinematic' },
  { value: 'playful', label: 'Playful & Fun' },
  { value: 'melancholic', label: 'Melancholic & Deep' },
];

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min === 0) return `${sec}s`;
  if (sec === 0) return `${min}m`;
  return `${min}m ${sec}s`;
}

export default function MusicGenerator({ userCredits, onCreditUpdate }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(3);
  const [forceInstrumental, setForceInstrumental] = useState(false);
  const [outputFormat, setOutputFormat] = useState('mp3_44100_128');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [mood, setMood] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1 credit = 1 second
  const creditsNeeded = duration;
  const hasEnoughCredits = userCredits >= creditsNeeded;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!hasEnoughCredits) {
      setError('Not enough credits. Please purchase more.');
      return;
    }

    setGenerating(true);

    try {
      let enhancedPrompt = prompt.trim();
      if (selectedGenre) {
        enhancedPrompt = `${selectedGenre} track - ${enhancedPrompt}`;
      }
      if (mood) {
        enhancedPrompt += `. ${mood} mood`;
      }

      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          duration: duration * 1000,
          forceInstrumental,
          outputFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError('Not enough credits.');
          return;
        }
        throw new Error(data.error || 'Failed to generate music');
      }

      setSuccess('Generation started! Redirecting to history...');
      onCreditUpdate(data.remainingCredits);
      setPrompt('');

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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Genre & Mood row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1.5">
              Genre
            </label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
              disabled={generating}
            >
              <option value="">Any genre</option>
              {MUSIC_GENRES.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-gray-300 mb-1.5">
              Mood
            </label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
              disabled={generating}
            >
              <option value="">Any mood</option>
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1.5">
            Describe your music <span className="text-purple-400">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A calm lo-fi beat with soft piano melodies and rain sounds..."
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors resize-none"
            rows={3}
            disabled={generating}
          />
        </div>

        {/* Duration slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="duration" className="text-sm font-medium text-gray-300">
              Duration
            </label>
            <span className="text-sm font-semibold text-white bg-[#1a1a1a] border border-[#333] px-2.5 py-0.5 rounded-md">
              {formatDuration(duration)}
            </span>
          </div>
          <input
            type="range"
            id="duration"
            min={3}
            max={600}
            step={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#333] rounded-full appearance-none cursor-pointer accent-purple-500"
            disabled={generating}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>3s</span>
            <span>5m</span>
            <span>10m</span>
          </div>
        </div>

        {/* Options row */}
        <div className="grid grid-cols-2 gap-4">
          <label htmlFor="instrumental" className="flex items-center gap-2.5 cursor-pointer bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 hover:border-[#444] transition-colors">
            <input
              type="checkbox"
              id="instrumental"
              checked={forceInstrumental}
              onChange={(e) => setForceInstrumental(e.target.checked)}
              className="w-4 h-4 bg-[#1a1a1a] border-[#333] rounded text-purple-500 focus:ring-purple-500/50"
              disabled={generating}
            />
            <span className="text-sm text-gray-300">Instrumental only</span>
          </label>
          <select
            id="format"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-colors"
            disabled={generating}
          >
            <option value="mp3_44100_128">MP3 128kbps</option>
            <option value="mp3_44100_192">MP3 192kbps</option>
            <option value="wav_44100_16">WAV 16-bit</option>
            <option value="wav_48000_24">WAV 24-bit</option>
          </select>
        </div>

        {/* Cost summary */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                <p className="text-sm font-semibold text-white">{formatDuration(duration)}</p>
              </div>
              <div className="w-px h-8 bg-[#333]" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cost</p>
                <p className={`text-sm font-semibold ${hasEnoughCredits ? 'text-white' : 'text-red-400'}`}>
                  {creditsNeeded} credits
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
              <p className={`text-sm font-semibold ${hasEnoughCredits ? 'text-green-400' : 'text-red-400'}`}>
                {userCredits} credits
              </p>
            </div>
          </div>
          {!hasEnoughCredits && (
            <div className="mt-3 pt-3 border-t border-[#333] flex items-center justify-between">
              <p className="text-xs text-red-400">You need {creditsNeeded - userCredits} more credits</p>
              <button
                type="button"
                onClick={() => router.push('/checkout-paddle')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Buy Credits &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={generating || !prompt.trim() || !hasEnoughCredits}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="spinner-small" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate ({formatDuration(duration)} &middot; {creditsNeeded} credits)</span>
          )}
        </button>
      </form>

      {/* Tips */}
      <div className="mt-6 pt-5 border-t border-[#333]">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tips for better results</h3>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Be specific about genre, mood, and instruments</li>
          <li>Describe the tempo (fast, slow, moderate)</li>
          <li>Mention influences or artists for reference</li>
          <li>Use instrumental only for background music</li>
        </ul>
      </div>
    </div>
  );
}
