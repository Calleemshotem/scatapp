(() => {
  const searchInput = document.getElementById('searchInput');
  const selectedCount = document.getElementById('selectedCount');
  const playlistEl = document.getElementById('playlist');
  const playlistListEl = document.getElementById('playlistList');
  const currentPlaylistTitle = document.getElementById('currentPlaylistTitle');
  const newPlaylistBtn = document.getElementById('newPlaylistBtn');
  const nowEl = document.getElementById('now');
  const playBtn = document.getElementById('play');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const repeatEl = document.getElementById('repeat');
  const seek = document.getElementById('seek');

  let tracks = [];
  try {
    tracks = JSON.parse(window.localStorage.getItem('scatapp_tracks') || '[]');
    if (!Array.isArray(tracks)) tracks = [];
  } catch {
    tracks = [];
  }
  if (tracks.length === 0) {
    try {
      const backup = JSON.parse(window.localStorage.getItem('scatapp_backup') || '[]');
      if (Array.isArray(backup) && backup.length > 0) tracks = backup;
    } catch {
      // ignore invalid backup
    }
  }
  let searchTerm = '';
  let playlists = JSON.parse(window.localStorage.getItem('scatapp_playlists') || '[]');
  let view = 'all';
  let current = -1;
  const audio = new Audio();

  const saveTracks = () => {
    try {
      window.localStorage.setItem('scatapp_tracks', JSON.stringify(tracks));
    } catch (e) {
      console.warn('Could not persist standalone tracks:', e);
    }
  };

  const savePlaylists = () => {
    try {
      window.localStorage.setItem('scatapp_playlists', JSON.stringify(playlists));
    } catch (e) {
      console.warn('Could not persist standalone playlists:', e);
    }
    renderPlaylists();
  };

  const contextMenuEl = document.createElement('div');
  contextMenuEl.className = 'fixed z-50 hidden min-w-[220px] rounded-2xl border border-white/10 bg-[#0a0a0a] text-sm text-slate-100 shadow-2xl';
  contextMenuEl.style.padding = '0.5rem';
  document.body.appendChild(contextMenuEl);
  contextMenuEl.style.display = 'none';

  const hideContextMenu = () => {
    contextMenuEl.style.display = 'none';
    contextMenuEl.innerHTML = '';
  };

  const showContextMenu = (x, y, trackId) => {
    contextMenuEl.innerHTML = '';
    contextMenuEl.style.display = 'block';
    contextMenuEl.style.left = `${x}px`;
    contextMenuEl.style.top = `${y}px`;

    const item = document.createElement('div');
    item.className = 'group relative rounded-xl p-2 hover:bg-white/10 transition';
    item.textContent = 'Add to Playlist';

    const submenu = document.createElement('div');
    submenu.className = 'absolute left-full top-0 hidden min-w-[200px] rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl group-hover:block';

    if (playlists.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'px-4 py-3 text-slate-400';
      emptyItem.textContent = 'No playlists yet';
      submenu.appendChild(emptyItem);
    } else {
      playlists.forEach((playlist) => {
        const playlistButton = document.createElement('button');
        playlistButton.type = 'button';
        playlistButton.className = 'w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition';
        playlistButton.textContent = playlist.name;
        playlistButton.addEventListener('click', (event) => {
          event.stopPropagation();
          if (!playlist.trackIds.includes(trackId)) {
            playlist.trackIds.push(trackId);
            savePlaylists();
          }
          hideContextMenu();
        });
        submenu.appendChild(playlistButton);
      });
    }

    item.appendChild(submenu);
    contextMenuEl.appendChild(item);
  };

  document.addEventListener('mousedown', (event) => {
    if (!contextMenuEl.contains(event.target)) {
      hideContextMenu();
    }
  });

  const createPlaylist = () => {
    const newPlaylist = {
      id: `plist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `Playlist ${playlists.length + 1}`,
      trackIds: []
    };
    playlists.push(newPlaylist);
    savePlaylists();
    setView(newPlaylist.id);
  };

  const addToPlaylist = (trackId, playlistId) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    if (!playlist.trackIds.includes(trackId)) {
      playlist.trackIds.push(trackId);
      savePlaylists();
    }
  };

  const setView = (newView) => {
    view = newView || 'all';
    updatePlaylistTitle();
    renderPlaylists();
    renderList();
  };

  const updatePlaylistTitle = () => {
    if (view === 'all') {
      currentPlaylistTitle.textContent = 'All songs';
      return;
    }
    const playlist = playlists.find((p) => p.id === view);
    currentPlaylistTitle.textContent = playlist ? playlist.name : 'All songs';
  };

  const renderPlaylists = () => {
    if (!playlistListEl) return;
    playlistListEl.innerHTML = '';

    const allButton = document.createElement('button');
    allButton.className = `w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${view === 'all' ? 'text-slate-100 bg-white/5' : 'text-slate-100 hover:bg-white/10 bg-transparent'}`;
    allButton.textContent = 'All songs';
    allButton.addEventListener('click', () => setView('all'));
    playlistListEl.appendChild(allButton);

    playlists.forEach((playlist) => {
      const btn = document.createElement('button');
      btn.className = `w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-100 hover:bg-white/10 transition ${view === playlist.id ? 'bg-white/10' : 'bg-transparent'}`;
      btn.textContent = playlist.name;
      btn.addEventListener('click', () => setView(playlist.id));
      playlistListEl.appendChild(btn);
    });
  };

  const setSearchTerm = (value) => {
    searchTerm = value.toLowerCase();
    renderList();
  };

  // Load tracks from live Railway backend and add to playlist
  const RAILWAY_API = 'https://scatapp-production.up.railway.app/api/tracks';
  fetch(RAILWAY_API)
    .then((r) => r.json())
    .then((remoteTracks) => {
      if (!Array.isArray(remoteTracks)) {
        throw new Error('Invalid remote tracks');
      }

      if (remoteTracks.length === 0) {
        // Try loading from localStorage backup if API returned empty
        const backup = window.localStorage.getItem('scatapp_backup');
        if (backup) {
          try {
            const parsed = JSON.parse(backup);
            parsed.forEach((t) => tracks.push(t));
          } catch (e) {
            console.warn('Invalid backup format', e);
          }
        }
      } else {
        tracks = remoteTracks.map((t) => {
          const url = (t.url || '').startsWith('http') ? t.url : (`https://scatapp-production.up.railway.app${t.url}`);
          return { id: t.id || Date.now() + Math.random(), title: t.title || t.fileName || 'Untitled', artist: t.artist || '', album: t.album || '', url };
        });

        saveTracks();
        try {
          window.localStorage.setItem('scatapp_backup', JSON.stringify(tracks));
        } catch (e) {
          console.warn('Could not write backup to localStorage:', e);
        }
      }

      renderList();
      if (current === -1 && tracks.length > 0) playIndex(0);
    })
    .catch((err) => {
      console.warn('Could not fetch remote tracks:', err);
      // Load from localStorage backup when offline
      const backup = window.localStorage.getItem('scatapp_backup');
      if (backup) {
        try {
          const parsed = JSON.parse(backup);
          parsed.forEach((t) => tracks.push(t));
          renderList();
          if (current === -1 && tracks.length > 0) playIndex(0);
        } catch (e) {
          console.warn('Invalid backup format', e);
        }
      }
    });

  function renderList() {
    playlistEl.innerHTML = '';
    const filteredTracks = getVisibleTracks();

    filteredTracks.forEach((t) => {
      const trackIndex = tracks.findIndex((item) => item.id === t.id);
      const div = document.createElement('div');
      div.className = 'track';
      div.innerHTML = `
        <div class="meta">
          <div class="track-title">${escapeHtml(t.title)}</div>
          <div class="track-subtitle">${escapeHtml(t.artist||'')}</div>
        </div>
        <div class="track-actions flex items-center gap-3">
          <div>${formatTime(t.duration||0)}</div>
          <div class="relative">
            <button type="button" class="track-menu rounded-full bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 transition">⋯</button>
            <div class="track-dropdown hidden absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-lg p-2 z-20"></div>
          </div>
        </div>
      `;
      div.addEventListener('click', (e) => {
        if (!e.target.closest('.track-menu')) {
          playIndex(trackIndex);
        }
      });
      div.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, t.id);
      });

      const dropdown = div.querySelector('.track-dropdown');
      const menuButton = div.querySelector('.track-menu');
      if (playlistDropdownContent(dropdown, t.id)) {
        menuButton.addEventListener('click', (event) => {
          event.stopPropagation();
          dropdown.classList.toggle('hidden');
        });
      }

      playlistEl.appendChild(div);
    });
  }

  function getVisibleTracks() {
    return tracks.filter((t) => {
      if (view !== 'all') {
        const playlist = playlists.find((p) => p.id === view);
        if (!playlist || !playlist.trackIds.includes(t.id)) return false;
      }
      if (!searchTerm) return true;
      const text = `${t.title} ${t.artist}`.toLowerCase();
      return text.includes(searchTerm);
    });
  }

  function playlistDropdownContent(dropdown, trackId) {
    if (!dropdown) return false;
    dropdown.innerHTML = '';
    if (playlists.length === 0) {
      dropdown.innerHTML = '<div class="text-xs text-slate-400 p-2">No playlists yet</div>';
      return true;
    }
    playlists.forEach((playlist) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'w-full text-left rounded-xl px-3 py-2 text-sm text-slate-100 hover:bg-white/10 transition';
      item.textContent = `Add to ${playlist.name}`;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        addToPlaylist(trackId, playlist.id);
        dropdown.classList.add('hidden');
      });
      dropdown.appendChild(item);
    });
    return true;
  }

  function escapeHtml(s){return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

  function formatTime(sec){sec = Math.floor(sec||0); const m = Math.floor(sec/60); const s = (sec%60).toString().padStart(2,'0'); return `${m}:${s}`}

  function updateNow(){
    if (current < 0) nowEl.textContent = 'No track';
    else nowEl.textContent = `${tracks[current].title} — ${tracks[current].artist||''}`;
  }

  function loadFiles(fileList){
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    selectedCount.textContent = `${files.length} file(s) selected`;
    files.forEach((f)=>{
      const url = URL.createObjectURL(f);
      const t = { id: Date.now()+Math.random(), title: f.name.replace(/\.[^/.]+$/,''), artist: '', album:'', url, fileName: f.name };
      tracks.push(t);
    });
    // Update backup so standalone keeps a copy
    try {
      window.localStorage.setItem('scatapp_backup', JSON.stringify(tracks));
    } catch (e) {
      console.warn('Could not write backup to localStorage:', e);
    }
    renderList();
    if (current === -1) playIndex(0);
  }

  function playIndex(i){
    if (!tracks[i]) return;
    current = i;
    audio.src = tracks[i].url;
    audio.play().catch(()=>{});
    updateNow();
  }

  playBtn.addEventListener('click', ()=>{
    if (audio.paused) audio.play(); else audio.pause();
    playBtn.textContent = audio.paused ? '▶' : '⏸';
  });

  prevBtn.addEventListener('click', ()=>{
    const visible = getVisibleTracks();
    const currentId = tracks[current]?.id;
    const index = visible.findIndex((t) => t.id === currentId);
    if (index > 0) {
      const nextTrack = visible[index - 1];
      const nextIndex = tracks.findIndex((item) => item.id === nextTrack.id);
      playIndex(nextIndex);
    }
  });
  nextBtn.addEventListener('click', ()=>{
    const visible = getVisibleTracks();
    const currentId = tracks[current]?.id;
    const index = visible.findIndex((t) => t.id === currentId);
    if (index !== -1 && index < visible.length - 1) {
      const nextTrack = visible[index + 1];
      const nextIndex = tracks.findIndex((item) => item.id === nextTrack.id);
      playIndex(nextIndex);
    }
  });

  audio.addEventListener('timeupdate', ()=>{
    seek.max = Math.floor(audio.duration || 0);
    seek.value = Math.floor(audio.currentTime || 0);
  });

  audio.addEventListener('ended', ()=>{
    if (repeatEl.checked) {
      audio.currentTime = 0;
      audio.play().catch(()=>{});
    } else {
      const visible = getVisibleTracks();
      const currentId = tracks[current]?.id;
      const index = visible.findIndex((t) => t.id === currentId);
      if (index !== -1 && index < visible.length - 1) {
        const nextTrack = visible[index + 1];
        const nextIndex = tracks.findIndex((item) => item.id === nextTrack.id);
        playIndex(nextIndex);
      }
    }
  });

  seek.addEventListener('input', (e)=>{
    audio.currentTime = parseFloat(e.target.value||0);
  });

  fileInput.addEventListener('change', (e)=>{
    loadFiles(e.target.files);
  });

  newPlaylistBtn.addEventListener('click', createPlaylist);

  searchInput.addEventListener('input', (e) => {
    setSearchTerm(e.target.value);
  });

  renderPlaylists();
  updatePlaylistTitle();

  // expose drag-and-drop
  document.addEventListener('dragover', (e)=>e.preventDefault());
  document.addEventListener('drop', (e)=>{e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files) loadFiles(e.dataTransfer.files)});

})();
