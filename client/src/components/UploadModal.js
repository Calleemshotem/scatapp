import React, { useState, useContext } from 'react';
import { api } from '../api';
import { MusicContext } from '../context/MusicContext';

const UploadModal = ({ isOpen, onClose, onUploadSuccess, isDarkTheme = true }) => {
  const [formData, setFormData] = useState({ title: '', artist: '', album: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Please select at least one audio file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadData = new FormData();
      // Append each selected file under the same field name 'audio'
      files.forEach((f) => uploadData.append('audio', f));
      // Apply artist/album to the batch; title will default to filename on server
      uploadData.append('artist', formData.artist || 'Unknown Artist');
      uploadData.append('album', formData.album || 'Unknown Album');

      await api.uploadTrack(uploadData);
      setFormData({ title: '', artist: '', album: '' });
      setFiles([]);
      onUploadSuccess();
      onClose();
    } catch (err) {
      const message = err.response?.data?.error || 'Upload failed';
      setError(message);

      // If upload failed due to network/offline, fall back to storing tracks in localStorage backup
      try {
        const isNetworkError = !err.response;
        if (isNetworkError && files && files.length > 0) {
          const existing = JSON.parse(window.localStorage.getItem('scatapp_backup') || '[]');
          const toAdd = files.map((f) => ({
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
            title: f.name.replace(/\.[^/.]+$/, ''),
            artist: formData.artist || 'Unknown Artist',
            album: formData.album || 'Unknown Album',
            url: URL.createObjectURL(f),
            duration: 0,
            createdAt: new Date()
          }));
          const merged = existing.concat(toAdd);
          window.localStorage.setItem('scatapp_backup', JSON.stringify(merged));
          // Notify parent to refresh (will pick up backup when API unreachable)
          onUploadSuccess && onUploadSuccess();
          onClose && onClose();
        }
      } catch (e) {
        console.warn('Could not save offline backup:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const bgClass = isDarkTheme ? 'bg-gray-900' : 'bg-white';
  const borderClass = isDarkTheme ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300';
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-900';
  const labelColor = isDarkTheme ? 'text-gray-300' : 'text-gray-700';
  const accentBtn = isDarkTheme ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`${bgClass} border ${borderClass} rounded-lg p-6 max-w-md w-full transform transition duration-300 hover:scale-100 animate-slideInUp`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${textColor}`}>Add Item</h2>
          <button
            onClick={onClose}
            className={`${isDarkTheme ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              File
            </label>
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className={`w-full px-3 py-2 ${inputBg} border rounded text-white transition`}
              required
            />
            <p className="text-sm text-gray-400 mt-2">{files.length > 0 ? `${files.length} file(s) selected` : 'No files selected'}</p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Name
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Item name"
              className={`w-full px-3 py-2 ${inputBg} border rounded transition focus:outline-none ${isDarkTheme ? 'focus:border-red-500' : 'focus:border-purple-500'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Author
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              placeholder="Author"
              className={`w-full px-3 py-2 ${inputBg} border rounded transition focus:outline-none ${isDarkTheme ? 'focus:border-red-500' : 'focus:border-purple-500'}`}
            />
          </div>

          {error && <p className="text-red-500 text-sm animate-slideInUp">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${accentBtn} disabled:bg-gray-600 text-white font-semibold py-2 rounded transition transform hover:scale-105`}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
