
import React, { useContext, useMemo, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import { api } from '../api';

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
};

const formatPlaylistDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
};

const PlaylistView = ({ playlist, tracks, onRemoveFromPlaylist, onTrackContextMenu = null, isDarkTheme }) => {
  const { playTrack } = useContext(MusicContext);
  const [openMenuId, setOpenMenuId] = useState(null);

  const playlistTracks = useMemo(() => {
    const ids = (playlist.trackIds || []).map((id) => String(id));
    return tracks.filter((track) => ids.includes(String(track.id)));
  }, [playlist, tracks]);

  const totalDuration = useMemo(() => {
    return playlistTracks.reduce((sum, track) => sum + (Number(track.duration) || 0), 0);
  }, [playlistTracks]);

  const playPlaylist = () => {
    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  const handlePlayTrack = (track) => {
    playTrack(track, playlistTracks);
  };

  const handleRemove = async (trackId) => {
    try {
      await api.removeTrackFromPlaylist(playlist.id, trackId);
      setOpenMenuId(null);
      if (onRemoveFromPlaylist) onRemoveFromPlaylist();
    } catch (err) {
      console.error('Error removing from playlist:', err);
    }
  };

  if (!playlist) {
    return (
      <div className={`text-center py-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Playlist not found.</p>
      </div>
    );
  }

  return (
    <div className="animate-slideInUp">
      <section className="rounded-3xl overflow-hidden shadow-2xl mb-8">
        <div className="relative bg-gradient-to-br from-slate-900 via-gray-950 to-black px-8 py-12 md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,185,84,0.3),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_30%)]" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Public Playlist</p>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white">{playlist.name}</h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
                Created by <span className="text-white">{playlist.creator || 'SCAT'}</span> · {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'} · {formatPlaylistDuration(totalDuration)}
              </p>
            </div>

            <div className="flex items-center gap-3 justify-start md:justify-end">
              <button
                type="button"
                onPointerDown={playPlaylist}
                onClick={playPlaylist}
                className="inline-flex items-center justify-center rounded-full bg-[#1DB954] p-5 shadow-2xl shadow-black/30 transition-transform hover:-translate-y-0.5 active:scale-95"
                title="Play"
              >
                <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/5 p-3 text-white transition hover:bg-white/10"
                title="Shuffle"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h4l5.5 8L14 20H4" />
                  <path d="M20 4v6M20 14v6" />
                </svg>
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/5 p-3 text-white transition hover:bg-white/10"
                title="Add"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5v14m7-7H5" />
                </svg>
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/5 p-3 text-white transition hover:bg-white/10"
                title="Download"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10m-4-4l4 4 4-4M6 19h12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className={`overflow-hidden rounded-3xl border ${isDarkTheme ? 'border-white/10 bg-slate-900/70' : 'border-gray-200 bg-white/80'} shadow-lg`}>
        <div className={`grid grid-cols-[72px_minmax(0,1fr)_220px_96px] items-center gap-4 px-6 py-3 text-xs uppercase tracking-widest text-slate-400 ${isDarkTheme ? 'border-b border-white/10' : 'border-b border-gray-200 bg-gray-50'}`}>
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span className="justify-self-end">⏱</span>
        </div>

        <div>
          {playlistTracks.map((track, index) => (
            <div
              key={track.id}
              onPointerDown={() => handlePlayTrack(track)}
              onClick={() => handlePlayTrack(track)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (onTrackContextMenu) onTrackContextMenu(e, track.id);
              }}
              className="group grid grid-cols-[72px_minmax(0,1fr)_220px_96px] items-center gap-4 px-6 py-4 transition hover:bg-white/10 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-slate-400">
                <span className="text-sm font-semibold transition opacity-100 group-hover:opacity-0">{index + 1}</span>
                <span className="hidden items-center justify-center rounded-full bg-white/10 p-2 text-white transition group-hover:flex">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>

              <div className="flex items-center gap-4 min-w-0">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 shadow-inner" />
                <div className="min-w-0">
                  <p className="truncate text-white font-semibold">{track.title}</p>
                  <p className="truncate text-sm text-slate-400">{track.artist || 'Unknown artist'}</p>
                </div>
              </div>

              <div className="truncate text-sm text-slate-300">
                {track.album || 'Single'}
              </div>

              <div className="flex items-center justify-end gap-3">
                <span className="text-sm text-slate-300">{formatDuration(Number(track.duration) || 0)}</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === track.id ? null : track.id);
                    }}
                    className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                    aria-label="More options"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4zm0 7a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                  {openMenuId === track.id && (
                    <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-xl">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(track.id);
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                      >
                        Remove from playlist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {playlistTracks.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              No songs found in this playlist yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
