import React, { createContext, useState, useCallback } from 'react';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const playTrack = useCallback((track, trackList = []) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setQueue(trackList);
    setCurrentIndex(trackList.findIndex(t => t.id === track.id));
    setCurrentTime(0);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextTrack = queue[currentIndex + 1];
      setCurrentTrack(nextTrack);
      setCurrentIndex(currentIndex + 1);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [currentIndex, queue]);

  const previous = useCallback(() => {
    if (currentIndex > 0) {
      const prevTrack = queue[currentIndex - 1];
      setCurrentTrack(prevTrack);
      setCurrentIndex(currentIndex - 1);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  }, [currentIndex, queue]);

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      volume,
      currentTime,
      duration,
      queue,
      currentIndex,
      playTrack,
      togglePlay,
      pause,
      next,
      previous,
      setVolume,
      setCurrentTime,
      setDuration,
      setIsPlaying
    }}>
      {children}
    </MusicContext.Provider>
  );
};
