import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FileText, Send, Trash2, Edit2, Check, X } from 'lucide-react';
import axios from 'axios';

const VideoNotes = memo(({ videoId }) => {
  const { mode } = useSelector((state) => state.theme);
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotes();
  }, [videoId]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/videos/${videoId}/notes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/student/videos/${videoId}/notes`,
        { content: content.trim(), timestamp: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes([response.data.note, ...notes]);
      setContent('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editContent.trim()) return;

    try {
      const response = await axios.put(
        `${API_URL}/student/notes/${noteId}`,
        { content: editContent.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(notes.map(n => n.id === noteId ? response.data.note : n));
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${API_URL}/student/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <FileText size={18} />
        Notes
      </h4>

      {/* Add Note Form */}
      <div className="mb-4 p-3 border rounded-lg">
        <textarea
          placeholder="Write a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          className={`w-full px-2 py-2 rounded mb-2 text-sm resize-none ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300'
          }`}
        />
        <button
          onClick={handleAddNote}
          disabled={isLoading}
          className="w-full px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {isLoading ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notes.length === 0 ? (
          <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No notes yet
          </p>
        ) : (
          notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white border'}`}
            >
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="3"
                    className={`w-full px-2 py-2 rounded mb-2 text-sm resize-none ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      className="flex-1 px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center justify-center gap-1"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-2 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 flex items-center justify-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {note.content}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditContent(note.content);
                      }}
                      className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
});

VideoNotes.displayName = 'VideoNotes';
export default VideoNotes;
