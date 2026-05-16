
import React, { useState, useEffect } from 'react';
import { MusicProvider } from './context/MusicContext';
import AudioPlayer from './components/AudioPlayer';
import PlayerControls from './components/PlayerControls';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import PlaylistModal from './components/PlaylistModal';
import TrackList from './components/TrackList';
import PlaylistView from './components/PlaylistView';
import AccountModal from './components/AccountModal';
import { api } from './api';

const AppContent = () => {
  const [currentView, setCurrentView] = useState({ type: 'home', id: null });
  const [tracks, setTracks] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('scatapp_tracks')) || [];
    } catch {
      return [];
    }
  });
  const [playlists, setPlaylists] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('scatapp_playlists')) || [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, trackId: null });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

  useEffect(() => {
    try {
      window.localStorage.setItem('scatapp_tracks', JSON.stringify(tracks));
    } catch (e) {
      console.warn('Could not persist tracks to localStorage:', e);
    }
  }, [tracks]);

  useEffect(() => {
    try {
      window.localStorage.setItem('scatapp_playlists', JSON.stringify(playlists));
    } catch (e) {
      console.warn('Could not persist playlists to localStorage:', e);
    }
  }, [playlists]);

  useEffect(() => {
    fetchTracks();
    fetchPlaylists();
  }, []);

  const fetchTracks = async (search = '') => {
    try {
      setLoading(true);
      const response = await api.getTracks(search);
      const data = response.data || [];

      if (Array.isArray(data) && data.length > 0) {
        setTracks(data);
      } else {
        // Do not wipe local tracks on empty response; keep persistent state instead.
        const backup = window.localStorage.getItem('scatapp_tracks');
        if (backup) {
          try {
            setTracks(JSON.parse(backup));
          } catch (e) {
            console.error('Invalid stored tracks data', e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching tracks:', err);
      const backup = window.localStorage.getItem('scatapp_tracks');
      if (backup) {
        try {
          setTracks(JSON.parse(backup));
        } catch (e) {
          console.error('Invalid stored tracks data', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.getPlaylists();
      const data = response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setPlaylists(data);
      } else {
        const stored = window.localStorage.getItem('scatapp_playlists');
        if (stored) {
          try {
            setPlaylists(JSON.parse(stored));
          } catch (e) {
            console.error('Invalid stored playlists data', e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
      const stored = window.localStorage.getItem('scatapp_playlists');
      if (stored) {
        try {
          setPlaylists(JSON.parse(stored));
        } catch (e) {
          console.error('Invalid stored playlists data', e);
        }
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchTracks(query);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    window.localStorage.setItem('scat-user', JSON.stringify(authenticatedUser));
    setShowAccountModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem('scat-user');
    setShowAccountModal(true);
  };

  const createNewPlaylist = async (name) => {
    if (!name || !name.trim()) return;
    const trimmedName = name.trim();
    const newPlaylist = {
      id: 'playlist_' + Date.now(),
      name: trimmedName,
      trackIds: [],
    };

    setPlaylists((prev) => [...prev, newPlaylist]);

    if (navigator.onLine) {
      try {
        await api.createPlaylist(trimmedName);
      } catch (err) {
        console.warn('Failed to sync playlist creation online:', err);
      }
    }

    return newPlaylist;
  };

  useEffect(() => {
    const savedUser = window.localStorage.getItem('scat-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setShowAccountModal(true);
    }
  }, []);

  const handlePlaylistClick = (playlist) => {
    console.log('Switching to playlist:', playlist.id, 'Name:', playlist.name, 'Track IDs:', playlist.trackIds);
    setCurrentView({ type: 'playlist', id: playlist.id });
  };

  const handleHomeClick = () => {
    setCurrentView({ type: 'home', id: null });
  };

  const addTrackToPlaylist = async (trackId, playlistId) => {
    const trackIdString = trackId?.toString?.() ?? '';
    const playlistIdString = playlistId?.toString?.() ?? '';
    const existing = playlists.find((playlist) => playlist.id?.toString() === playlistIdString);
    if (!existing) return;
    if ((existing.trackIds || []).map((id) => id.toString()).includes(trackIdString)) return;

    console.log('Successfully added track:', trackIdString, 'to playlist:', playlistIdString);

    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id?.toString() !== playlistIdString) return playlist;
      const existingTrackIds = Array.isArray(playlist.trackIds) ? playlist.trackIds : [];
      return {
        ...playlist,
        trackIds: [...new Set([...existingTrackIds.map((id) => id.toString()), trackIdString])],
      };
    });

    setPlaylists(updatedPlaylists);

    try {
      window.localStorage.setItem('scatapp_playlists', JSON.stringify(updatedPlaylists));
    } catch (e) {
      console.warn('Could not persist playlists to localStorage:', e);
    }

    if (navigator.onLine) {
      try {
        await api.addTrackToPlaylist(playlistIdString, trackIdString);
      } catch (err) {
        console.warn('Failed to sync add-to-playlist online, saving locally:', err);
      }
    }

    const addedTrack = tracks.find((track) => track.id?.toString() === trackIdString);
    setNotification(`${addedTrack?.title || 'Track'} added to playlist!`);
    setContextMenu({ visible: false, x: 0, y: 0, trackId: null });
  };

  const handleContextMenu = (event, trackId) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, trackId });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu((prev) => prev.visible ? { ...prev, visible: false } : prev);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setContextMenu((prev) => prev.visible ? { ...prev, visible: false } : prev);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timeout);
  }, [notification]);

  const activePlaylist = playlists.find((playlist) => playlist.id?.toString() === String(currentView.id));

  const renderContent = () => {
    if (currentView.type === 'playlist' && activePlaylist) {
      return (
        <PlaylistView
          playlist={activePlaylist}
          tracks={tracks}
          onRemoveFromPlaylist={fetchPlaylists}
          onTrackContextMenu={handleContextMenu}
          isDarkTheme={isDarkTheme}
        />
      );
    }

    return (
      <div className="animate-slideInUp">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          {currentView.type === 'home' ? 'Home' : 'Browse'}
        </h2>
        <TrackList tracks={tracks} onTrackRemoved={fetchTracks} onTrackContextMenu={handleContextMenu} isDarkTheme={isDarkTheme} />
      </div>
    );
  };

  const bgColor = isDarkTheme ? 'bg-gray-950' : 'bg-gray-100';
  const headerBg = isDarkTheme ? 'bg-gray-900' : 'bg-white';
  const accentColor = isDarkTheme ? 'from-red-600 to-red-500' : 'from-purple-600 to-purple-500';

  return (
    <div className={`flex flex-col md:flex-row h-screen md:h-[100dvh] ${bgColor} text-white overflow-hidden transition-colors relative`}>
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView}
        onChangeView={setCurrentView}
        playlists={playlists}
        onPlaylistClick={handlePlaylistClick}
        onCreatePlaylist={createNewPlaylist}
        isDarkTheme={isDarkTheme}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col relative z-0">
        {/* Header */}
        <header className={`${headerBg} ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'} border-b p-4 md:p-6 sticky top-0 z-30 transition-colors`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tracks or artists..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full px-4 py-2 ${isDarkTheme ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-200 border-gray-300 text-gray-900 placeholder-gray-600'} border rounded-full focus:outline-none ${isDarkTheme ? 'focus:border-red-500' : 'focus:border-purple-500'} transition`}
              />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`rounded-full px-3 py-2 text-sm font-medium ${isDarkTheme ? 'bg-gray-800 text-red-300' : 'bg-gray-200 text-purple-700'}`}>
                {user ? `Hi, ${user.displayName || user.email}` : 'Welcome'}
              </div>
              <button
                onClick={user ? handleLogout : () => setShowAccountModal(true)}
                className={`px-4 py-2 rounded-full transition transform hover:scale-105 ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-900'}`}
              >
                {user ? 'Sign Out' : 'Sign In'}
              </button>
              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={`px-4 py-2 rounded-full transition transform hover:scale-105 ${isDarkTheme ? 'bg-gray-800 text-yellow-400' : 'bg-gray-300 text-gray-900'}`}
                title={isDarkTheme ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setShowPlaylistModal(true)}
                className={`${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} ${isDarkTheme ? 'text-white' : 'text-gray-900'} px-4 py-2 rounded-full transition`}
              >
                + New
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className={`bg-gradient-to-r ${accentColor} text-white px-4 py-2 rounded-full transition font-semibold transform hover:scale-105`}
              >
                Add
              </button>
            </div>
          </div>
        </header>

        {notification && (
          <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-md bg-[#1DB954] px-4 py-3 text-white font-semibold shadow-xl transition-opacity duration-300">
            {notification}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollable p-4 md:p-6 pb-40 relative z-0">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className={`text-center text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'} animate-pulse-custom`}>
                Loading...
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className={`md:hidden fixed bottom-20 left-0 right-0 ${isDarkTheme ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t flex justify-around p-2 transition-colors z-20`}>
        <button
          onClick={() => handleHomeClick()}
          className={`flex-1 py-2 text-center transition text-2xl ${
            currentView.type === 'home' ? (isDarkTheme ? 'text-red-500' : 'text-purple-500') : (isDarkTheme ? 'text-gray-400' : 'text-gray-600')
          }`}
        >
          ⊙
        </button>
        <button
          onClick={() => handleHomeClick()}
          className={`flex-1 py-2 text-center transition text-2xl ${
            currentView.type === 'home' ? (isDarkTheme ? 'text-red-500' : 'text-purple-500') : (isDarkTheme ? 'text-gray-400' : 'text-gray-600')
          }`}
        >
          ★
        </button>
        <button
          onClick={() => setShowPlaylistModal(true)}
          className={`flex-1 py-2 text-center transition text-2xl ${isDarkTheme ? 'text-gray-400 hover:text-red-500' : 'text-gray-600 hover:text-purple-500'}`}
        >
          ≡
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          className={`flex-1 py-2 text-center transition text-2xl ${isDarkTheme ? 'text-gray-400 hover:text-red-500' : 'text-gray-600 hover:text-purple-500'}`}
        >
          +
        </button>
      </nav>

      {/* Modals */}
      <div className="relative z-40">
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={fetchTracks}
          isDarkTheme={isDarkTheme}
        />

        <PlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          onPlaylistCreated={fetchPlaylists}
          isDarkTheme={isDarkTheme}
        />

        <AccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onAuthSuccess={handleAuthSuccess}
          isDarkTheme={isDarkTheme}
        />

        {contextMenu.visible && (
          <div
            className="fixed z-50 rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl"
            style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 220 }}
            onContextMenu={(event) => event.preventDefault()}
          >
            <div className="group relative rounded-xl p-2 hover:bg-white/5 transition cursor-default">
              <div className="flex items-center justify-between text-sm text-white font-medium">
                <span>Add to Playlist</span>
                <span className="text-slate-400">›</span>
              </div>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-0 ml-2 w-56 rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl transition-all duration-150">
                {playlists.length === 0 ? (
                  <div className="p-3 text-sm text-slate-400">No playlists yet</div>
                ) : (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        addTrackToPlaylist(contextMenu.trackId, playlist.id);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/5 transition"
                    >
                      {playlist.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Players */}
      <AudioPlayer />
      <PlayerControls isDarkTheme={isDarkTheme} />
    </div>
  );
};

function App() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}

export default App;
