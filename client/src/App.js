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
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

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
        try {
          window.localStorage.setItem('scatapp_backup', JSON.stringify(data));
        } catch (e) {
          console.warn('Could not write backup to localStorage:', e);
        }
      } else {
        // API returned empty list - try loading backup
        const backup = window.localStorage.getItem('scatapp_backup');
        if (backup) setTracks(JSON.parse(backup));
        else setTracks([]);
      }
    } catch (err) {
      console.error('Error fetching tracks:', err);
      const backup = window.localStorage.getItem('scatapp_backup');
      if (backup) {
        try { setTracks(JSON.parse(backup)); } catch (e) { console.error('Invalid backup data', e); setTracks([]); }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.getPlaylists();
      console.log('Fetched playlists:', response.data);
      setPlaylists(response.data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
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

  const activePlaylist = playlists.find((playlist) => playlist.id === currentView.id);

  const renderContent = () => {
    if (currentView.type === 'playlist' && activePlaylist) {
      return (
        <PlaylistView
          playlist={activePlaylist}
          tracks={tracks}
          onRemoveFromPlaylist={fetchPlaylists}
          isDarkTheme={isDarkTheme}
        />
      );
    }

    return (
      <div className="animate-slideInUp">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          {currentView.type === 'home' ? 'Home' : 'Browse'}
        </h2>
        <TrackList tracks={tracks} onTrackRemoved={fetchTracks} isDarkTheme={isDarkTheme} />
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
