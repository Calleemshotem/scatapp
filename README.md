# SCAT - Music Streaming App

A full-stack music streaming application with a modern, animated UI compatible for both PC and mobile. Built with React, Tailwind CSS, and Node.js/Express.

## Features

- 🎵 **Music Player** - Play, pause, skip, and control volume with a responsive player interface
- 📤 **Upload Tracks** - Upload MP3, WAV, OGG, and other audio formats
- 📋 **Playlists** - Create, manage, and organize your favorite tracks into playlists
- 🔍 **Search** - Search for tracks and artists in real-time
- ❤️ **Like Tracks** - Mark your favorite tracks
- 🎨 **Dual Theme** - Switch between dark theme (black & red) and light theme (grey & purple)
- ✨ **Smooth Animations** - Fully animated UI with smooth transitions
- 📱 **Responsive Design** - Seamless experience on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Storage**: Local file uploads with persistent JSON storage
- **Architecture**: RESTful API

## Project Structure

```
scatapp/
├── server/                 # Backend
│   ├── server.js          # Main server file
│   ├── package.json
│   └── uploads/           # Uploaded audio files
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Music context
│   │   ├── App.js         # Main app
│   │   └── api.js         # API utilities
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. Navigate to project directory:
```bash
cd scatapp
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Start the application:
```bash
npm run dev
```

The app will open at `http://localhost:3000` and server runs on `http://localhost:5000`

### Alternative: Use Batch File (Windows)

Simply double-click `start.bat` in the project folder to start everything automatically!

## Usage

1. **Upload a Track**
   - Click the "Upload" button
   - Select an audio file, enter title and artist
   - Click "Upload"

2. **Create a Playlist**
   - Click "+ Playlist" button
   - Enter playlist name and create

3. **Play Music**
   - Click on any track to start playing
   - Use the player controls at the bottom

4. **Switch Themes**
   - Click the sun/moon icon in the header to toggle between dark and light themes

5. **Search**
   - Use the search bar to find tracks by title or artist name

## Theme Options

### Dark Theme
- **Primary Color**: Red (#ff0000)
- **Secondary Color**: Black (#0a0a0a)
- **Accent Color**: Dark Grey (#1a1a1a)

### Light Theme
- **Primary Color**: Purple (#a855f7)
- **Secondary Color**: Light Grey (#f3f4f6)
- **Accent Color**: Medium Grey (#e5e7eb)

## Responsive Design

- **Desktop**: Full sidebar navigation, optimized layout
- **Mobile**: Bottom navigation bar, touch-friendly controls
- **Tablet**: Hybrid layout with collapsible sidebar

## Animations

The app features smooth animations throughout:
- Fade-in effects for content
- Slide-up animations for modals
- Bounce animations on app logo
- Smooth hover transitions
- Glowing effects on interactive elements

## Data Persistence

All uploaded tracks and playlists are automatically saved to `data.json` in the server folder. Your music library persists even after closing the app!

## API Endpoints

### Tracks
- `GET /api/tracks?search=query` - Get all tracks
- `POST /api/tracks/upload` - Upload a new track
- `DELETE /api/tracks/:trackId` - Delete a track

### Playlists
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create a new playlist
- `POST /api/playlists/:playlistId/tracks` - Add track to playlist
- `DELETE /api/playlists/:playlistId/tracks/:trackId` - Remove track from playlist
- `DELETE /api/playlists/:playlistId` - Delete playlist

## Future Enhancements

- User authentication and accounts
- Cloud storage integration
- Shuffle and repeat modes
- Queue management
- Equalizer controls
- Social features (sharing, following)
- Database integration (MongoDB/PostgreSQL)

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

