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
// Define data file path
const DATA_FILE = path.join(__dirname, 'data.json');

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

const readDataFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(fileContent || '{}');
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }
  return { tracks: [], playlists: [] };
};

const writeDataFile = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing data file:', err);
  }
};

const saveData = () => {
  try {
    writeDataFile({ tracks, playlists });
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

// Create a single track (JSON) - useful for clients that POST metadata instead of uploading files
app.post('/api/tracks', (req, res) => {
  try {
    const { title, artist, album, url } = req.body || {};
    if (!title || !url) {
      return res.status(400).json({ error: 'title and url are required' });
    }

    const fileData = readDataFile();
    const existingTracks = Array.isArray(fileData.tracks) ? fileData.tracks : [];
    const existingPlaylists = Array.isArray(fileData.playlists) ? fileData.playlists : [];

    const track = {
      id: uuidv4(),
      title: title || 'Untitled',
      artist: artist || 'Unknown Artist',
      album: album || 'Unknown Album',
      url,
      duration: 0,
      createdAt: new Date()
    };

    existingTracks.push(track);
    tracks = existingTracks;
    playlists = existingPlaylists;

    writeDataFile({ tracks: existingTracks, playlists: existingPlaylists });
    return res.status(201).json(track);
  } catch (err) {
    console.error('Error creating track:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload track(s) - supports multiple files under field name 'audio'
app.post('/api/tracks/upload', upload.array('audio', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const fileData = readDataFile();
  const existingTracks = Array.isArray(fileData.tracks) ? fileData.tracks : [];
  const existingPlaylists = Array.isArray(fileData.playlists) ? fileData.playlists : [];

  const created = [];
  const artistFromBody = req.body.artist || 'Unknown Artist';
  const albumFromBody = req.body.album || 'Unknown Album';

  req.files.forEach((file) => {
    const title = (req.body.title && req.files.length === 1)
      ? req.body.title
      : (file.originalname ? file.originalname.replace(/\.[^/.]+$/, '') : 'Untitled');

    const track = {
      id: uuidv4(),
      title,
      artist: artistFromBody,
      album: albumFromBody,
      url: file.path,
      duration: 0,
      createdAt: new Date()
    };

    existingTracks.push(track);
    created.push(track);
  });

  tracks = existingTracks;
  playlists = existingPlaylists;
  writeDataFile({ tracks: existingTracks, playlists: existingPlaylists });
  res.status(201).json(created);
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

  const fileData = readDataFile();
  const existingTracks = Array.isArray(fileData.tracks) ? fileData.tracks : [];
  const existingPlaylists = Array.isArray(fileData.playlists) ? fileData.playlists : [];

  const playlist = {
    id: uuidv4(),
    name,
    trackIds: [],
    createdAt: new Date()
  };

  existingPlaylists.push(playlist);
  tracks = existingTracks;
  playlists = existingPlaylists;
  writeDataFile({ tracks: existingTracks, playlists: existingPlaylists });
  res.status(201).json(playlist);
});

// Add track to playlist
app.post('/api/playlists/:playlistId/tracks', (req, res) => {
  const { playlistId } = req.params;
  const { trackId } = req.body;
  const playlistIdString = playlistId?.toString?.() ?? '';
  const trackIdString = trackId?.toString?.() ?? '';

  const fileData = readDataFile();
  const existingTracks = Array.isArray(fileData.tracks) ? fileData.tracks : [];
  const existingPlaylists = Array.isArray(fileData.playlists) ? fileData.playlists : [];

  const playlist = existingPlaylists.find(p => p.id?.toString() === playlistIdString);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  const existingTrackIds = Array.isArray(playlist.trackIds) ? playlist.trackIds.map((id) => id.toString()) : [];
  if (!existingTrackIds.includes(trackIdString)) {
    playlist.trackIds = [...(playlist.trackIds || []), trackIdString];
  }

  tracks = existingTracks;
  playlists = existingPlaylists;
  writeDataFile({ tracks: existingTracks, playlists: existingPlaylists });
  res.json(playlist);
});

// Alias route for add semantics
app.post('/api/playlists/:playlistId/add', (req, res) => {
  const { playlistId } = req.params;
  const { trackId } = req.body;
  const playlistIdString = playlistId?.toString?.() ?? '';
  const trackIdString = trackId?.toString?.() ?? '';

  const fileData = readDataFile();
  const existingTracks = Array.isArray(fileData.tracks) ? fileData.tracks : [];
  const existingPlaylists = Array.isArray(fileData.playlists) ? fileData.playlists : [];

  const playlist = existingPlaylists.find(p => p.id?.toString() === playlistIdString);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  const existingTrackIds = Array.isArray(playlist.trackIds) ? playlist.trackIds.map((id) => id.toString()) : [];
  if (!existingTrackIds.includes(trackIdString)) {
    playlist.trackIds = [...(playlist.trackIds || []), trackIdString];
  }

  tracks = existingTracks;
  playlists = existingPlaylists;
  writeDataFile({ tracks: existingTracks, playlists: existingPlaylists });
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
