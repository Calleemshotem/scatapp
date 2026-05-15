import axios from 'axios';

export const api = {
  // Tracks
  getTracks: (search = '') => axios.get('https://scatapp-production.up.railway.app/api/tracks', { params: { search } }),
  uploadTrack: (formData) => axios.post('https://scatapp-production.up.railway.app/api/tracks/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTrack: (trackId) => axios.delete(`https://scatapp-production.up.railway.app/api/tracks/${trackId}`),

  // Playlists
  getPlaylists: () => axios.get('https://scatapp-production.up.railway.app/api/playlists'),
  createPlaylist: (name) => axios.post('https://scatapp-production.up.railway.app/api/playlists', { name }),
  deletePlaylist: (playlistId) => axios.delete(`https://scatapp-production.up.railway.app/api/playlists/${playlistId}`),
  addTrackToPlaylist: (playlistId, trackId) => 
    axios.post(`https://scatapp-production.up.railway.app/api/playlists/${playlistId}/tracks`, { trackId }),
  removeTrackFromPlaylist: (playlistId, trackId) =>
    axios.delete(`https://scatapp-production.up.railway.app/api/playlists/${playlistId}/tracks/${trackId}`),
};
