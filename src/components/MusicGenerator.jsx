import { useState } from "react";
import TrackCard from "./TrackCard";

const GENRES = [
  "Rock", "Pop", "Electronic", "Classical", "Jazz", "Hip-Hop", "R&B",
  "Country", "Folk", "Blues", "Reggae", "Metal", "Punk", "Soul", "Funk"
];

const MOODS = [
  "Energetic", "Chill", "Sad", "Happy", "Dramatic", "Romantic",
  "Dark", "Peaceful", "Epic", "Mysterious", "Playful", "Intense"
];

const DURATIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 180, label: "3 minutes" },
];

export default function MusicGenerator({ userCredits, onCreditUpdate }) {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [mood, setMood] = useState("Chill");
  const [duration, setDuration] = useState(60);
  const [generating, setGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please write a description for your music");
      return;
    }
    if (userCredits < 2) {
      setError("Not enough credits. You need 2 credits per song.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, genre, mood, duration }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error generating music");
      }
      setCurrentTrack({
        _id: data.trackId,
        jobId: data.jobId,
        status: "generating",
        progress: 0,
        title: genre + " - " + mood,
        description: prompt,
        genre,
        mood,
        duration,
        createdAt: new Date(),
      });
      pollTrackStatus(data.trackId);
      if (onCreditUpdate) {
        onCreditUpdate(data.remainingCredits);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const pollTrackStatus = async (trackId) => {
    const poll = setInterval(async () => {
      try {
        const response = await fetch("/api/music/status?trackId=" + trackId);
        const data = await response.json();
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(poll);
          setCurrentTrack((prev) => {
            return {
              ...prev,
              status: data.status,
              audioUrl: data.audioUrl,
              coverUrl: data.coverUrl,
              title: data.title || prev?.title,
              progress: 100,
            };
          });
        } else {
          setCurrentTrack((prev) => {
            return {
              ...prev,
              progress: data.progress || 0,
            };
          });
        }
      } catch (err) {
        clearInterval(poll);
        console.error("Error polling status:", err);
      }
    }, 3000);
    setTimeout(() => {
      clearInterval(poll);
    }, 300000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="window-buttons">
            <button className="window-button window-button-close"></button>
            <button className="window-button window-button-minimize"></button>
            <button className="window-button window-button-maximize"></button>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
            Create New Song
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-400 mb-2 font-medium">
            Describe your music <span className="text-yellow-500">*</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Eg: A relaxing song with acoustic guitar and piano, soft and melodic..."
            className="textarea"
            rows={3}
          ></textarea>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 mb-2 font-medium">Genre</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="select">
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 font-medium">Mood</label>
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="select">
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 font-medium">Duration</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="select">
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || userCredits < 2}
          className="btn-gradient w-full text-lg py-4"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </span>
          ) : userCredits < 2 ? (
            `Insufficient credits (${userCredits}/2)`
          ) : (
            `Generate Music (2 credits)`
          )}
        </button>
      </div>

      {currentTrack && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="window-buttons">
              <button className="window-button window-button-close"></button>
              <button className="window-button window-button-minimize"></button>
              <button className="window-button window-button-maximize"></button>
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Generation in Progress
            </h3>
          </div>
          <TrackCard track={currentTrack} />
        </div>
      )}
    </div>
  );
}
