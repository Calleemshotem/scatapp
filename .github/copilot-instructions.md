# SCAT - Music Streaming App - Development Instructions

This is a full-stack music streaming application built with React, Tailwind CSS, Node.js, and Express.

## Project Overview

- **Frontend**: React 18 with Tailwind CSS for responsive UI (mobile & desktop)
- **Backend**: Node.js/Express for music management and file uploads
- **Features**: Music player, playlists, search, upload functionality, dual themes, smooth animations
- **App Name**: SCAT
- **Theme**: Dark mode (Black & Red) and Light mode (Grey & Purple)

## Quick Start

### 1. Install All Dependencies

```bash
npm run install-all
```

This will install dependencies for the root, server, and client.

### 2. Start the Application

**Option A: Run both server and client together**
```bash
npm run dev
```

**Option B: Run separately in two terminals**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

**Option C: Windows Batch File**
Double-click `start.bat` in the project directory

### 3. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
scatapp/
├── server/
│   ├── server.js           # Express server
│   ├── package.json
│   ├── .env
│   ├── data.json           # Persistent data storage
│   └── uploads/            # Uploaded audio files
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── AudioPlayer.js
│   │   │   ├── PlayerControls.js
│   │   │   ├── UploadModal.js
│   │   │   ├── PlaylistModal.js
│   │   │   ├── TrackList.js
│   │   │   ├── Sidebar.js
│   │   │   └── PlaylistDropdown.js
│   │   ├── context/        # React Context
│   │   │   └── MusicContext.js
│   │   ├── App.js          # Main component
│   │   ├── api.js          # API calls
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## Key Features

### 🎵 Music Player
- Play/pause controls
- Next/previous track buttons
- Volume control
- Progress bar with seek functionality
- Auto-play next track

### 📤 Upload Tracks
- Audio file upload
- Support for MP3, WAV, OGG, WebM formats
- Add title and artist metadata
- Persistent storage (saved to data.json)

### 📋 Playlists
- Create custom playlists
- Add/remove tracks from playlists
- Delete playlists
- View playlist tracks
- All data persists after app restart

### 🔍 Search
- Real-time search by track title or artist
- Filters discover view

### 🎨 Dual Theme
- **Dark Theme**: Black background with red accents
- **Light Theme**: Grey background with purple accents
- One-click theme toggle via sun/moon icon

### ✨ Animations
- Smooth fade-in effects
- Slide-up animations for content
- Bounce animations on logo
- Hover scale transitions
- Glowing effects on buttons
- Staggered animation delays

### 📱 Responsive Design
- **Desktop**: Full sidebar navigation, optimized grid layout
- **Mobile**: Bottom tab navigation, compact controls
- **Tablet**: Hybrid layout with collapsible elements

## API Endpoints

### Tracks
- `GET /api/tracks` - Get all tracks (supports search param)
- `POST /api/tracks/upload` - Upload new track
- `DELETE /api/tracks/:trackId` - Delete track

### Playlists
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create playlist
- `POST /api/playlists/:playlistId/tracks` - Add track to playlist
- `DELETE /api/playlists/:playlistId/tracks/:trackId` - Remove from playlist
- `DELETE /api/playlists/:playlistId` - Delete playlist

## Environment Configuration

### Server (.env)
```
PORT=5000
NODE_ENV=development
```

### Client
The client is configured to proxy API calls to `http://localhost:5000` (see `proxy` in package.json).

## Data Persistence

All uploaded tracks and playlists are automatically saved to `server/data.json`. Data loads on server startup.

## Theme Configuration

### Dark Theme Colors
- Primary: Red (#ff0000)
- Secondary: Black (#0a0a0a)
- Accent: Dark Grey (#1a1a1a)

### Light Theme Colors
- Primary: Purple (#a855f7)
- Secondary: Light Grey (#f3f4f6)
- Accent: Medium Grey (#e5e7eb)

Themes are controlled via `isDarkTheme` state in App.js and applied to all components.

## Animations Reference

Available CSS animations:
- `.animate-slideInUp` - Slide up with fade
- `.animate-fadeIn` - Fade in effect
- `.animate-pulse-custom` - Pulse animation
- `.animate-bounce-custom` - Bounce animation
- `.animate-slideInLeft` - Slide left with fade
- `.glow-red` - Red glowing effect

## Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:
- Kill the process: `lsof -i :3000` then `kill -9 <PID>`
- Or change PORT in .env for the server

### CORS Issues
The server has CORS enabled for all origins during development. For production, update the CORS configuration in server.js.

### Module Not Found
Ensure all dependencies are installed:
```bash
npm run install-all
```

### Audio Files Not Playing
Check that:
1. Server is running on port 5000
2. Uploads folder exists in server directory
3. File format is supported (MP3, WAV, OGG, WebM)
4. Audio URLs are correctly formatted in data.json

## Development Workflow

1. **Backend Changes**: Modify files in `server/` and the server will auto-reload with nodemon
2. **Frontend Changes**: React's hot reload will automatically refresh the page
3. **Adding Features**: Create new components in `client/src/components/` and import them in `App.js`
4. **Adding API Endpoints**: Update `server/server.js` and corresponding API calls in `client/src/api.js`
5. **Theme Updates**: Add/modify colors in `client/src/index.css` CSS variables and component theme props

## Next Steps / Enhancements

- [ ] Add user authentication (JWT)
- [ ] Connect to database (MongoDB/PostgreSQL)
- [ ] Add shuffle and repeat modes
- [ ] Implement user profiles
- [ ] Add social features (likes, comments)
- [ ] Deploy to cloud (Heroku, Vercel, Railway)
- [ ] Add PWA support for offline mode
- [ ] Implement queue management UI
- [ ] Add analytics tracking
- [ ] Improve animation performance

## Testing

### Manual Testing
1. Upload an audio file through the UI
2. Play the track and verify controls work
3. Create a playlist and add tracks to it
4. Test search functionality
5. Test theme toggle (dark/light)
6. Test on mobile device (use responsive mode or test on actual device)
7. Close and reopen app to verify data persistence

## Production Build

### Frontend
```bash
cd client
npm run build
```

### Backend
For production, update:
- CORS settings for specific domains
- Use environment variables for sensitive data
- Set up a proper database
- Enable HTTPS
- Use a production-grade server (PM2, etc.)

## Deployment

Recommended platforms:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Heroku, AWS, DigitalOcean
- **Full Stack**: Railway (combined deployment)

## Support & Documentation

For more details, see:
- Frontend: [client/README.md](../client/README.md)
- Main README: [README.md](../README.md)
