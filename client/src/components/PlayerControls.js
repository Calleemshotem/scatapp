import React, { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const PlayerControls = ({ isDarkTheme = true }) => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    previous,
    next,
    setVolume,
    setCurrentTime
  } = useContext(MusicContext);

  if (!currentTrack) return null;

  const handleSeek = (e) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const bgGradient = isDarkTheme 
    ? 'bg-gradient-to-t from-gray-900 to-gray-800' 
    : 'bg-gradient-to-t from-gray-100 to-gray-50';
  
  const borderColor = isDarkTheme ? 'border-gray-700' : 'border-gray-300';
  const accentColor = isDarkTheme ? 'accent-red-500' : 'accent-purple-500';
  const textColor = isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  const primaryText = isDarkTheme ? 'text-white' : 'text-gray-900';

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${bgGradient} border-t ${borderColor} p-4 z-50 animate-slideInUp transition-colors`}>
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4 flex items-center gap-2">
          <span className={`text-xs ${textColor} w-10`}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className={`flex-1 h-1 bg-${isDarkTheme ? 'gray-700' : 'gray-300'} rounded-full appearance-none cursor-pointer ${accentColor}`}
          />
          <span className={`text-xs ${textColor} w-10 text-right`}>{formatTime(duration)}</span>
        </div>

        {/* Player Info and Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className={`${primaryText} font-semibold truncate text-sm md:text-base animate-fadeIn`}>{currentTrack.title}</p>
            <p className={`${textColor} truncate text-xs md:text-sm`}>{currentTrack.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={previous}
              className={`${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition p-2 transform hover:scale-110`}
              title="Previous"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button
              onPointerDown={togglePlay}
              onClick={togglePlay}
              className={`bg-gradient-to-r ${isDarkTheme ? 'from-red-600 to-red-500 hover:from-red-700 hover:to-red-600' : 'from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'} text-white rounded-full p-3 transition transform hover:scale-110 shadow-lg cursor-pointer`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={next}
              className={`${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition p-2 transform hover:scale-110`}
              title="Next"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 18h2V6h-2v12zm-11-7l8.5-6v12l-8.5-6z" />
              </svg>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-4">
              <svg className={`w-4 h-4 ${textColor} hidden md:block`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className={`w-20 h-1 rounded-full appearance-none cursor-pointer ${accentColor} ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-300'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
