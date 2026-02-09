import Link from 'next/link';

export default function TrackCard({ track }) {
  return (
    <div className="card">
      {/* Cover Art */}
      <div className="relative aspect-square bg-gradient-to-br from-red-900/20 via-yellow-900/20 to-green-900/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-16 h-16 text-gray-600" fill="url(#gradient-card)" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="gradient-card" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF5F57" />
                <stop offset="50%" stopColor="#FEBC2E" />
                <stop offset="100%" stopColor="#28C840" />
              </linearGradient>
            </defs>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        )}

        {/* Audio Player Overlay */}
        {track.status === 'completed' && track.audioUrl && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <audio controls src={track.audioUrl} className="w-full max-w-[280px]" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {track.status === 'generating' && (
            <span className="badge-yellow">
              Generating...
            </span>
          )}
          {track.status === 'completed' && (
            <span className="badge-green">
              Completed
            </span>
          )}
          {track.status === 'failed' && (
            <span className="badge-red">
              Failed
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {track.status === 'generating' && track.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
              style={{ width: `${track.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-1 truncate">
        {track.title}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {track.genre && (
          <span className="badge">
            {track.genre}
          </span>
        )}
        {track.mood && (
          <span className="badge">
            {track.mood}
          </span>
        )}
        {track.duration && (
          <span className="badge text-gray-500">
            {track.duration}s
          </span>
        )}
      </div>

      {/* Description */}
      {track.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {track.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {track.status === 'completed' && track.audioUrl && (
          <>
            <a
              href={track.audioUrl}
              download
              className="btn-primary text-sm py-2 px-3 flex-1 text-center"
            >
              Download
            </a>
          </>
        )}
        {track.status === 'failed' && (
          <span className="text-red-400 text-sm font-medium">Generation failed</span>
        )}
      </div>

      {/* Date */}
      <div className="mt-3 text-xs text-gray-600">
        {new Date(track.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}
