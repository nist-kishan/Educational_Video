import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, X, Eye, Trash2, Filter } from 'lucide-react';
import axios from 'axios';

const ModerationDashboard = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFlaggedContent();
  }, [statusFilter]);

  const fetchFlaggedContent = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/admin/moderation?status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFlaggedContent(response.data.flaggedContent || []);
    } catch (error) {
      console.error('Error fetching flagged content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (contentId) => {
    try {
      await axios.post(
        `${API_URL}/admin/moderation/${contentId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFlaggedContent();
      setSelectedContent(null);
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const handleReject = async (contentId, reason) => {
    try {
      await axios.post(
        `${API_URL}/admin/moderation/${contentId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFlaggedContent();
      setSelectedContent(null);
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle size={32} className="text-red-500" />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Content Moderation
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending', count: 12, color: 'bg-yellow-500' },
            { label: 'Approved', count: 145, color: 'bg-green-500' },
            { label: 'Rejected', count: 28, color: 'bg-red-500' },
            { label: 'Total Reviewed', count: 185, color: 'bg-blue-500' }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
            >
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stat.count}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
          </div>
        ) : flaggedContent.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No flagged content
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {flaggedContent.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSeverityColor(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.contentType}: {item.contentTitle}
                      </h3>
                    </div>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Flagged by: {item.flaggedBy}
                    </p>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Reason: {item.reason}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(item.flaggedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedContent(item)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) handleReject(item.id, reason);
                          }}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedContent(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedContent.contentType}: {selectedContent.contentTitle}
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Content
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedContent.content}
                </p>
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Flag Reason
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedContent.reason}
                </p>
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Flagged By
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedContent.flaggedBy}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedContent(null)}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
});

ModerationDashboard.displayName = 'ModerationDashboard';
export default ModerationDashboard;
