import { useState } from 'react';
import TrackCard from './TrackCard';

const GENRES = ['All', 'Rock', 'Pop', 'Electronic', 'Classical', 'Jazz', 'Hip-Hop', 'R&B'];
const MOODS = ['All', 'Energetic', 'Chill', 'Sad', 'Happy', 'Dramatic', 'Romantic'];

export default function HistoryGallery({ tracks }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');

  // Filter tracks
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      !searchQuery ||
      track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;
    const matchesMood = selectedMood === 'All' || track.mood === selectedMood;

    return matchesSearch && matchesGenre && matchesMood;
  });

  return (
    <div>
      {/* Filters */}
      <div className="card mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-gray-400 mb-2 font-medium">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description..."
              className="input"
            />
          </div>

          {/* Genre & Mood Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-gray-400 mb-2 font-medium">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="select"
              >
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-gray-400 mb-2 font-medium">Mood</label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="select"
              >
                {MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-gray-500 mb-4 font-medium">
        {filteredTracks.length} {filteredTracks.length === 1 ? 'song' : 'songs'} found
      </p>

      {/* Grid */}
      {filteredTracks.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => (
            <TrackCard key={track._id} track={track} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 3-.895 3-2 3 2 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No songs found</p>
        </div>
      )}
    </div>
  );
}
