import React, { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import { api } from '../api';

const TrackList = ({ tracks, showPlaylistActions = false, playlistId = null, onTrackRemoved = null, isDarkTheme = true }) => {
  const { playTrack } = useContext(MusicContext);

  const handlePlayTrack = (track) => {
    playTrack(track, tracks);
  };

  const handleRemoveFromPlaylist = async (trackId) => {
    if (!playlistId) return;
    try {
      await api.removeTrackFromPlaylist(playlistId, trackId);
      if (onTrackRemoved) onTrackRemoved();
    } catch (err) {
      console.error('Error removing track:', err);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    try {
      await api.deleteTrack(trackId);
      if (onTrackRemoved) onTrackRemoved();
    } catch (err) {
      console.error('Error deleting track:', err);
    }
  };

  if (!tracks || tracks.length === 0) {
    return (
      <div className={`text-center py-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
        <p className="animate-fadeIn">No tracks found</p>
      </div>
    );
  }

  const bgHover = isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-purple-50';
  const bgBase = isDarkTheme ? 'bg-gray-800' : 'bg-gray-100';
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  const gradient = isDarkTheme ? 'from-red-400 to-red-600' : 'from-purple-400 to-purple-600';

  return (
    <div className="space-y-2">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={`flex items-center justify-between p-3 ${bgBase} ${bgHover} rounded transition cursor-pointer group transform hover:scale-101 animate-slideInUp`}
          onClick={() => handlePlayTrack(track)}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v9.28c-1.63-.51-3.5.13-4.84 1.46-1.33 1.33-1.97 3.2-1.46 4.84.51 1.63 2.04 2.75 3.84 2.75 2.21 0 4-1.79 4-4V3h4v12h-2V3h-2v9.28zm-6 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${textColor} font-medium truncate`}>{track.title}</p>
              <p className={`${textMuted} text-sm truncate`}>{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
            {showPlaylistActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromPlaylist(track.id);
                }}
                className="text-red-500 hover:text-red-400 p-2 transform hover:scale-110 transition"
                title="Remove from playlist"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
                </svg>
              </button>
            )}
            {!showPlaylistActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTrack(track.id);
                }}
                className="text-red-500 hover:text-red-400 p-2 transform hover:scale-110 transition"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackList;
