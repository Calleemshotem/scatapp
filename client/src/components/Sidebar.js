import React from 'react';

const Sidebar = ({ activeTab, onTabChange, playlists, onPlaylistClick, isDarkTheme }) => {
  return (
    <aside className={`hidden md:flex flex-col w-64 ${isDarkTheme ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r h-screen fixed left-0 top-0 overflow-y-auto animate-slideInLeft transition-colors z-50`}>
      {/* Logo */}
      <div className={`p-6 ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'} border-b`}>
        <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-red-500' : 'text-purple-600'} animate-bounce-custom`}>
          SCAT
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          type="button"
          onClick={() => onTabChange('discover')}
          className={`w-full text-left px-4 py-3 rounded transition transform hover:scale-105 cursor-pointer ${
            activeTab === 'discover'
              ? (isDarkTheme ? 'bg-red-600 text-white' : 'bg-purple-600 text-white')
              : (isDarkTheme ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100')
          }`}
        >
          Browse
        </button>
        <button
          type="button"
          onClick={() => onTabChange('liked')}
          className={`w-full text-left px-4 py-3 rounded transition transform hover:scale-105 cursor-pointer ${
            activeTab === 'liked'
              ? (isDarkTheme ? 'bg-red-600 text-white' : 'bg-purple-600 text-white')
              : (isDarkTheme ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100')
          }`}
        >
          Saved
        </button>

        <div className="py-4">
          <p className={`px-4 text-xs font-semibold ${isDarkTheme ? 'text-gray-500' : 'text-gray-600'} uppercase`}>Collections</p>
          <div className="space-y-1 mt-2">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                onClick={() => {
                  console.log('Sidebar: Clicked playlist button for:', playlist.id);
                  onPlaylistClick(playlist);
                }}
                className={`w-full text-left px-4 py-2 rounded text-sm transition transform hover:scale-105 cursor-pointer ${
                  activeTab === `playlist-${playlist.id}`
                    ? (isDarkTheme ? 'bg-gray-700 text-white' : 'bg-purple-100 text-purple-600')
                    : (isDarkTheme ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100')
                }`}
              >
                {playlist.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
