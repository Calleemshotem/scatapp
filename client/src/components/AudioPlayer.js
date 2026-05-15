import React, { useContext, useRef, useEffect, useState } from 'react';
import { MusicContext } from '../context/MusicContext';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [repeat, setRepeat] = useState(false);
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    next
  } = useContext(MusicContext);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => console.log('Play error:', err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Play error:', err));
      } else {
        // Advance to next track
        next();
        // Ensure the newly-loaded track actually starts playing.
        // `next()` may set `isPlaying` to true already, but if it was
        // already true, forcing play here ensures playback begins.
        setTimeout(() => {
          const a = audioRef.current;
          if (a) a.play().catch(err => console.log('Play error:', err));
        }, 150);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [next, setCurrentTime, setDuration, repeat]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = parseFloat(e.target.value);
    }
  };

  if (!currentTrack) return null;

  const buttonClasses = repeat
    ? 'bg-red-600 text-white hover:bg-red-500'
    : 'bg-gray-700 text-white hover:bg-gray-600';

  return (
    <div className="relative">
      <audio
        ref={audioRef}
        src={currentTrack?.url.startsWith('http') ? currentTrack.url : `https://scatapp-production.up.railway.app${currentTrack.url}`}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />
      <button
        type="button"
        onClick={() => setRepeat(!repeat)}
        className={`fixed bottom-28 right-4 z-50 rounded-full px-4 py-2 text-sm font-semibold transition ${buttonClasses}`}
        title="Repeat"
      >
        {repeat ? 'Repeat On' : 'Repeat Off'}
      </button>
    </div>
  );
};

export default AudioPlayer;
