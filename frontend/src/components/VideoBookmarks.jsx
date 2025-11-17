import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, Play } from 'lucide-react';
import axios from 'axios';

const VideoBookmarks = memo(({ videoId, onJumpToTime }) => {
  const { mode } = useSelector((state) => state.theme);
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookmarks();
  }, [videoId]);

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/videos/${videoId}/bookmarks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleAddBookmark = async () => {
    if (currentTime === undefined) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/student/videos/${videoId}/bookmarks`,
        { timestamp: Math.floor(currentTime), title: title || `Bookmark at ${Math.floor(currentTime)}s` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookmarks([response.data.bookmark, ...bookmarks]);
      setTitle('');
    } catch (error) {
      console.error('Error adding bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await axios.delete(`${API_URL}/student/bookmarks/${bookmarkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <Bookmark size={18} />
        Bookmarks
      </h4>

      {/* Add Bookmark Form */}
      <div className="mb-4 p-3 border rounded-lg">
        <input
          type="text"
          placeholder="Bookmark title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-2 py-1 rounded mb-2 text-sm ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300'
          }`}
        />
        <button
          onClick={handleAddBookmark}
          disabled={isLoading}
          className="w-full px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Bookmark'}
        </button>
      </div>

      {/* Bookmarks List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No bookmarks yet
          </p>
        ) : (
          bookmarks.map((bookmark) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-2 rounded flex items-center justify-between ${
                isDark ? 'bg-gray-700' : 'bg-white border'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {bookmark.title}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatTime(bookmark.timestamp)}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => onJumpToTime?.(bookmark.timestamp)}
                  className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                >
                  <Play size={14} />
                </button>
                <button
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                  className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
});

VideoBookmarks.displayName = 'VideoBookmarks';
export default VideoBookmarks;
