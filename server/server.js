const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// ADD THESE TWO NEW LINES HERE:
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// This tells the server your Cloudinary identity
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// This tells Multer to send files to the Cloud instead of your computer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'scatapp_music',
    resource_type: 'video', // Cloudinary uses 'video' category for audio files
    format: async (req, file) => 'mp3', 
  },
});

const upload = multer({ storage: storage });

// That's it! Cloudinary handles the naming and the filtering for you.
// Load data from file or initialize empty
let tracks = [];
let playlists = [];

const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      tracks = parsed.tracks || [];
      playlists = parsed.playlists || [];
      console.log(`Loaded ${tracks.length} tracks and ${playlists.length} playlists from storage`);
    }
  } catch (err) {
    console.error('Error loading data:', err);
    tracks = [];
    playlists = [];
  }
};

const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tracks, playlists }, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

// Load data on startup
loadData();

// Routes

// Get all tracks
app.get('/api/tracks', (req, res) => {
  const search = req.query.search?.toLowerCase() || '';
  const filtered = tracks.filter(track => 
    track.title.toLowerCase().includes(search) || 
    track.artist.toLowerCase().includes(search)
  );
  res.json(filtered);
});

// Upload track
app.post('/api/tracks/upload', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const track = {
    id: uuidv4(),
    title: req.body.title || req.file.originalname.replace(/\.[^/.]+$/, ''),
    artist: req.body.artist || 'Unknown Artist',
    url: req.file.path,
    duration: 0,
    createdAt: new Date()
  };

  tracks.push(track);
  saveData(); // Save to file
  res.status(201).json(track);
});

// Get all playlists
app.get('/api/playlists', (req, res) => {
  const playlistsWithTracks = playlists.map(p => ({
    ...p,
    tracks: p.trackIds.map(id => tracks.find(t => t.id === id))
  }));
  res.json(playlistsWithTracks);
});

// Create playlist
app.post('/api/playlists', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  const playlist = {
    id: uuidv4(),
    name,
    trackIds: [],
    createdAt: new Date()
  };

  playlists.push(playlist);
  saveData(); // Save to file
  res.status(201).json(playlist);
});

// Add track to playlist
app.post('/api/playlists/:playlistId/tracks', (req, res) => {
  const { playlistId } = req.params;
  const { trackId } = req.body;

  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  if (!playlist.trackIds.includes(trackId)) {
    playlist.trackIds.push(trackId);
  }

  saveData(); // Save to file
  res.json(playlist);
});

// Remove track from playlist
app.delete('/api/playlists/:playlistId/tracks/:trackId', (req, res) => {
  const { playlistId, trackId } = req.params;

  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  playlist.trackIds = playlist.trackIds.filter(id => id !== trackId);
  saveData(); // Save to file
  res.json(playlist);
});

// Delete playlist
app.delete('/api/playlists/:playlistId', (req, res) => {
  const { playlistId } = req.params;
  playlists = playlists.filter(p => p.id !== playlistId);
  saveData(); // Save to file
  res.json({ success: true });
});

// Delete track
app.delete('/api/tracks/:trackId', (req, res) => {
  const { trackId } = req.params;
  const track = tracks.find(t => t.id === trackId);
  
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  // Remove from playlists
  playlists.forEach(p => {
    p.trackIds = p.trackIds.filter(id => id !== trackId);
  });

  // Delete file
  const filename = track.url.split('/').pop();
  const filepath = path.join('uploads', filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }

  tracks = tracks.filter(t => t.id !== trackId);
  saveData(); // Save to file
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
