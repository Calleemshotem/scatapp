import React, { useContext, useRef, useEffect } from 'react';
import { MusicContext } from '../context/MusicContext';

const AudioPlayer = () => {
  const audioRef = useRef(null);
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
    const handleEnded = () => next();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [next, setCurrentTime, setDuration]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = parseFloat(e.target.value);
    }
  };

  if (!currentTrack) return null;

  return (
    <audio
      ref={audioRef}
      src={`https://scatapp-production.up.railway.app${currentTrack.url}`}
      onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
    />
  );
};

export default AudioPlayer;
