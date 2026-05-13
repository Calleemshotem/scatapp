const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Data persistence file
const DATA_FILE = 'data.json';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio\/(mpeg|mp3|wav|ogg|webm)/;
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

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
    url: `/uploads/${req.file.filename}`,
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
