import React, { useState, useRef } from 'react';
import { api } from '../api';

const PlaylistDropdown = ({ tracks, selectedTrackId = null, onSelect = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const dropdownRef = useRef(null);

  const handleOpenDropdown = async () => {
    try {
      const response = await api.getPlaylists();
      setPlaylists(response.data);
      setIsOpen(true);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await api.addTrackToPlaylist(playlistId, selectedTrackId);
      setIsOpen(false);
      if (onSelect) onSelect();
    } catch (err) {
      console.error('Error adding to playlist:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenDropdown}
        className="text-gray-300 hover:text-white p-2"
        title="Add to playlist"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="p-4 text-gray-400 text-sm">No playlists yet</div>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 hover:text-white transition border-b border-gray-700 last:border-b-0"
              >
                {playlist.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistDropdown;
