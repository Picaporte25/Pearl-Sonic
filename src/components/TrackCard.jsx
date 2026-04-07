import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

export default function TrackCard({ track }) {
  const audioOverlayRef = useRef(null);
  const [localTrack, setLocalTrack] = useState(track);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef(null);

  // Log when track prop changes
  useEffect(() => {
    console.log('🔄 Track prop updated:', {
      trackId: track.id,
      status: track.status,
      audioUrl: track.audioUrl,
      falRequestId: track.fal_request_id
    });
    setLocalTrack(track);
  }, [track]);

  const handleTouchStart = (e) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Poll for status updates if track is generating
  useEffect(() => {
    console.log('🎵 TrackCard mounted:', {
      trackId: track.id,
      initialStatus: track.status,
      hasAudioUrl: !!track.audioUrl,
      hasFalRequestId: !!track.falRequestId
    });

    if (track.status === 'generating' && !isPolling) {
      console.log('🚀 Starting polling for generating track');
      setIsPolling(true);
      pollForUpdates();
    }

    return () => {
      if (pollIntervalRef.current) {
        console.log('🛑 Cleaning up polling interval');
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [track.status, track.id]); // Only re-run when track status or ID changes

  const pollForUpdates = async () => {
    console.log('🔄 Starting polling for track:', track.id, 'Current status:', track.status);
    try {
      // Clear any existing interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      // Poll every 3 seconds
      pollIntervalRef.current = setInterval(async () => {
        try {
          console.log('📡 Polling FAL.ai status for track:', track.id);
          const response = await fetch(`/api/music/status?trackId=${track.id}`);
          const data = await response.json();

          console.log('📊 Polling response:', {
            trackId: track.id,
            status: data.status,
            audioUrl: data.audioUrl,
            progress: data.progress,
            title: data.title
          });

          if (data.status) {
            // Update local track state with the new data
            console.log('🔄 Updating local track state:', {
              oldStatus: localTrack.status,
              newStatus: data.status,
              oldAudioUrl: localTrack.audioUrl,
              newAudioUrl: data.audioUrl
            });

            setLocalTrack(prevTrack => ({
              ...prevTrack,
              status: data.status,
              audioUrl: data.audioUrl,
              progress: data.progress,
              title: data.title || prevTrack.title
            }));

            // Stop polling if completed or failed
            if (data.status === 'completed' || data.status === 'failed') {
              console.log('✅ Polling stopped - Track status:', data.status);
              setIsPolling(false);
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            }
          }
        } catch (error) {
          console.error('❌ Error polling for status:', error);
          // Don't stop polling on network errors, just log them
        }
      }, 3000); // Poll every 3 seconds

    } catch (error) {
      console.error('❌ Error starting polling:', error);
    }
  };

  return (
    <div className="card">
      {/* Cover Art */}
      <div className="relative aspect-square bg-gradient-to-br from-red-900/20 via-yellow-900/20 to-green-900/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
        {localTrack.coverUrl ? (
          <img src={localTrack.coverUrl} alt={localTrack.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-16 h-16 text-gray-600" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="gradient-card" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <path fill="url(#gradient-card)" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z" />
          </svg>
        )}

        {/* Audio Player Overlay */}
        {localTrack.status === 'completed' && localTrack.audioUrl && (
          <div
            ref={audioOverlayRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <audio
              controls
              src={localTrack.audioUrl}
              className="w-full max-w-[280px]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {localTrack.status === 'generating' && (
            <span className="badge-yellow">
              Generating...
            </span>
          )}
          {localTrack.status === 'completed' && (
            <span className="badge-green">
              Completed
            </span>
          )}
          {localTrack.status === 'failed' && (
            <span className="badge-red">
              Failed
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {localTrack.status === 'generating' && localTrack.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${localTrack.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-1 truncate">
        {localTrack.title}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {localTrack.genre && (
          <span className="badge">
            {localTrack.genre}
          </span>
        )}
        {localTrack.mood && (
          <span className="badge">
            {localTrack.mood}
          </span>
        )}
        {localTrack.duration && (
          <span className="badge text-gray-500">
            {localTrack.duration}s
          </span>
        )}
      </div>

      {/* Description */}
      {localTrack.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {localTrack.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {localTrack.status === 'completed' && localTrack.audioUrl && (
          <>
            <a
              href={localTrack.audioUrl}
              download
              className="btn-primary text-sm py-2 px-3 flex-1 text-center"
            >
              Download
            </a>
          </>
        )}
        {localTrack.status === 'failed' && (
          <span className="text-red-400 text-sm font-medium">Generation failed</span>
        )}
      </div>

      {/* Date */}
      <div className="mt-3 text-xs text-gray-600">
        {new Date(localTrack.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}
