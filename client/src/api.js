import axios from 'axios';

const API_BASE = 'https://scatapp-production.up.railway.app/api';

export const api = {
  // Tracks
  getTracks: (search = '') => axios.get(`${API_BASE}/tracks`, { params: { search } }),
  uploadTrack: (formData) => axios.post(`${API_BASE}/tracks/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTrack: (trackId) => axios.delete(`${API_BASE}/tracks/${trackId}`),

  // Playlists
  getPlaylists: () => axios.get(`${API_BASE}/playlists`),
  createPlaylist: (name) => axios.post(`${API_BASE}/playlists`, { name }),
  deletePlaylist: (playlistId) => axios.delete(`${API_BASE}/playlists/${playlistId}`),
  addTrackToPlaylist: (playlistId, trackId) => 
    axios.post(`${API_BASE}/playlists/${playlistId}/tracks`, { trackId }),
  removeTrackFromPlaylist: (playlistId, trackId) =>
    axios.delete(`${API_BASE}/playlists/${playlistId}/tracks/${trackId}`),
};
