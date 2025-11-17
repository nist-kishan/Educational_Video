import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MessageCircle, Send, ThumbsUp, Trash2 } from 'lucide-react';
import axios from 'axios';

const VideoComments = memo(({ videoId }) => {
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchComments();
  }, [videoId, page]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/videos/${videoId}/comments?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/student/videos/${videoId}/comments`,
        { content: content.trim(), timestamp: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([response.data.comment, ...comments]);
      setContent('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(
        `${API_URL}/student/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/student/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <MessageCircle size={24} />
        Comments
      </h3>

      {/* Add Comment Form */}
      <div className="mb-6 p-4 border rounded-lg">
        <textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          className={`w-full px-3 py-2 rounded mb-3 resize-none ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300'
          }`}
        />
        <button
          onClick={handleAddComment}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <Send size={16} />
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {comment.users?.first_name || 'Anonymous'}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
              {user?.id === comment.student_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {comment.content}
            </p>
            <button
              onClick={() => handleLikeComment(comment.id)}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
            >
              <ThumbsUp size={14} />
              {comment.likes || 0}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

VideoComments.displayName = 'VideoComments';
export default VideoComments;
