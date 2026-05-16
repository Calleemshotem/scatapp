
import React, { useContext, useState, useEffect, useRef } from 'react';
import { MusicContext } from '../context/MusicContext';
import { api } from '../api';

const TrackList = ({ tracks, showPlaylistActions = false, playlistId = null, onTrackRemoved = null, playlists = [], addTrackToPlaylist = null, isDarkTheme = true }) => {
  const { playTrack } = useContext(MusicContext);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const containerRef = useRef(null);

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

  const handlePlusClick = (e, track) => {
    e.stopPropagation();
    setActiveDropdownId((prev) => (prev === track.id ? null : track.id));
  };

  useEffect(() => {
    const handleDocClick = () => {
      setActiveDropdownId(null);
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

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
    <div className="space-y-2" ref={containerRef}>
      {tracks.map((track, index) => (
        <div
          key={track.id}
          onPointerDown={() => handlePlayTrack(track)}
          onClick={() => handlePlayTrack(track)}
          className={`relative flex items-center justify-between p-3 ${bgBase} ${bgHover} rounded transition cursor-pointer group transform hover:scale-101 animate-slideInUp`}
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
              {track.album && (
                <p className={`${textMuted} text-xs truncate`}>{track.album}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4 opacity-100 transition">
            <button
              onClick={(e) => handlePlusClick(e, track)}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 cursor-pointer text-xl"
              title="Add to playlist"
            >
              +
            </button>

            {activeDropdownId === track.id && (
              <div onClick={(e) => e.stopPropagation()} className="absolute right-6 top-full mt-2 bg-[#282828] text-white border border-[#3e3e3e] rounded-md shadow-2xl py-1 w-48 z-50">
                {playlists.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-slate-400">No playlists</div>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(null);
                        if (addTrackToPlaylist) addTrackToPlaylist(track.id, pl.id);
                      }}
                      className="w-full text-left hover:bg-[#3e3e3e] px-4 py-2 text-sm"
                    >
                      {pl.name}
                    </button>
                  ))
                )}
              </div>
            )}

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
