import React, { useState, useEffect } from 'react';
import { MusicProvider } from './context/MusicContext';
import AudioPlayer from './components/AudioPlayer';
import PlayerControls from './components/PlayerControls';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import PlaylistModal from './components/PlaylistModal';
import TrackList from './components/TrackList';
import PlaylistDropdown from './components/PlaylistDropdown';
import { api } from './api';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
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
      setTracks(response.data);
    } catch (err) {
      console.error('Error fetching tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.getPlaylists();
      setPlaylists(response.data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchTracks(query);
  };

  const handlePlaylistClick = (playlist) => {
    setCurrentPlaylist(playlist);
    setActiveTab(`playlist-${playlist.id}`);
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await api.deletePlaylist(playlistId);
      fetchPlaylists();
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
        setActiveTab('discover');
      }
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  const renderContent = () => {
    if (activeTab === 'discover') {
      return (
        <div className="animate-slideInUp">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Browse
          </h2>
          <TrackList tracks={tracks} onTrackRemoved={fetchTracks} isDarkTheme={isDarkTheme} />
        </div>
      );
    }

    if (activeTab === 'liked') {
      return (
        <div className="animate-slideInUp">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Saved Items
          </h2>
          <TrackList tracks={tracks.filter(t => t.liked)} onTrackRemoved={fetchTracks} isDarkTheme={isDarkTheme} />
        </div>
      );
    }

    if (activeTab.startsWith('playlist-') && currentPlaylist) {
      return (
        <div className="animate-slideInUp">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {currentPlaylist.name}
              </h2>
              <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentPlaylist.trackIds?.length || 0} items
              </p>
            </div>
            <button
              onClick={() => handleDeletePlaylist(currentPlaylist.id)}
              className={`${isDarkTheme ? 'text-red-500 hover:text-red-400' : 'text-purple-500 hover:text-purple-400'} p-2 transition`}
              title="Delete"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
              </svg>
            </button>
          </div>
          <TrackList 
            tracks={currentPlaylist.tracks || []} 
            showPlaylistActions={true}
            playlistId={currentPlaylist.id}
            onTrackRemoved={fetchPlaylists}
            isDarkTheme={isDarkTheme}
          />
        </div>
      );
    }

    return null;
  };

  const bgColor = isDarkTheme ? 'bg-gray-950' : 'bg-gray-100';
  const sidebarBg = isDarkTheme ? 'bg-gray-900' : 'bg-white';
  const headerBg = isDarkTheme ? 'bg-gray-900' : 'bg-white';
  const accentColor = isDarkTheme ? 'from-red-600 to-red-500' : 'from-purple-600 to-purple-500';
  const accentHover = isDarkTheme ? 'hover:bg-red-600' : 'hover:bg-purple-600';

  return (
    <div className={`flex flex-col md:flex-row h-screen ${bgColor} text-white overflow-hidden transition-colors`}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playlists={playlists}
        onPlaylistClick={handlePlaylistClick}
        isDarkTheme={isDarkTheme}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <header className={`${headerBg} ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'} border-b p-4 md:p-6 sticky top-0 z-40 transition-colors`}>
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
            <div className="flex gap-2 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40">
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
      <nav className={`md:hidden fixed bottom-20 left-0 right-0 ${isDarkTheme ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t flex justify-around p-2 transition-colors`}>
        <button
          onClick={() => {
            setActiveTab('discover');
            setCurrentPlaylist(null);
          }}
          className={`flex-1 py-2 text-center transition text-2xl ${
            activeTab === 'discover' ? (isDarkTheme ? 'text-red-500' : 'text-purple-500') : (isDarkTheme ? 'text-gray-400' : 'text-gray-600')
          }`}
        >
          ⊙
        </button>
        <button
          onClick={() => {
            setActiveTab('liked');
            setCurrentPlaylist(null);
          }}
          className={`flex-1 py-2 text-center transition text-2xl ${
            activeTab === 'liked' ? (isDarkTheme ? 'text-red-500' : 'text-purple-500') : (isDarkTheme ? 'text-gray-400' : 'text-gray-600')
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
