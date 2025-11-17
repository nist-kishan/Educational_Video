import { memo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const Forum = memo(() => {
  const { courseId } = useParams();
  const { mode } = useSelector((state) => state.theme);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchThreads();
  }, [courseId]);

  const fetchThreads = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/courses/${courseId}/forum/threads?page=1&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setThreads(response.data.threads || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const fetchReplies = async (threadId) => {
    try {
      const response = await axios.get(
        `${API_URL}/student/forum/threads/${threadId}/replies?page=1&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplies(response.data.replies || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleCreateThread = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/student/courses/${courseId}/forum/threads`,
        { title: title.trim(), content: content.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setThreads([response.data.thread, ...threads]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyToThread = async () => {
    if (!replyContent.trim() || !selectedThread) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/student/forum/threads/${selectedThread.id}/replies`,
        { content: replyContent.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplies([...replies, response.data.reply]);
      setReplyContent('');
    } catch (error) {
      console.error('Error replying to thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Discussion Forum
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads List */}
          <div className="lg:col-span-1">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h2 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Threads
              </h2>

              {/* Create Thread Form */}
              <div className="mb-6 p-3 border rounded-lg">
                <input
                  type="text"
                  placeholder="Thread title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-2 py-1 rounded mb-2 text-sm ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-white'
                  }`}
                />
                <textarea
                  placeholder="Thread content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="3"
                  className={`w-full px-2 py-1 rounded mb-2 text-sm resize-none ${
                    isDark ? 'bg-gray-700 text-white' : 'bg-white'
                  }`}
                />
                <button
                  onClick={handleCreateThread}
                  disabled={isLoading}
                  className="w-full px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Create Thread
                </button>
              </div>

              {/* Threads List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {threads.map((thread) => (
                  <motion.button
                    key={thread.id}
                    onClick={() => {
                      setSelectedThread(thread);
                      fetchReplies(thread.id);
                    }}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'bg-blue-500 text-white'
                        : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{thread.title}</p>
                    <p className="text-xs opacity-75">{thread.replies || 0} replies</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Thread Detail */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <button
                  onClick={() => setSelectedThread(null)}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-4"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedThread.title}
                </h2>

                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedThread.content}
                </p>

                {/* Replies */}
                <div className="mb-6">
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Replies ({replies.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {replies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-white border'}`}
                      >
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {reply.content}
                        </p>
                        <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(reply.created_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <div className="p-3 border rounded-lg">
                  <textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows="3"
                    className={`w-full px-2 py-2 rounded mb-2 text-sm resize-none ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-white'
                    }`}
                  />
                  <button
                    onClick={handleReplyToThread}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Send size={16} />
                    Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  Select a thread to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Forum.displayName = 'Forum';
export default Forum;
