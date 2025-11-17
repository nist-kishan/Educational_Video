import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, X } from 'lucide-react';
import axios from 'axios';

const CourseCompletionModal = memo(({ enrollmentId, courseId, onComplete, onClose }) => {
  const { mode } = useSelector((state) => state.theme);
  const [isLoading, setIsLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showModal, setShowModal] = useState(true);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const handleCompleteCourse = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/student/enrollments/${enrollmentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCertificate(response.data.certificate);
      onComplete?.();
    } catch (error) {
      console.error('Error completing course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/certificates/${certificate.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Trigger download
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `certificate-${certificate.certificate_number}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleShareCertificate = () => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.certificate_number}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Certificate link copied to clipboard!');
  };

  if (!showModal) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`relative p-8 rounded-lg max-w-md w-full mx-4 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <button
          onClick={() => {
            setShowModal(false);
            onClose?.();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {certificate ? (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            </motion.div>

            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Congratulations!
            </h2>

            <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You have successfully completed this course
            </p>

            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Certificate Number
              </p>
              <p className={`font-mono text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {certificate.certificate_number}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadCertificate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Download size={18} />
                Download Certificate
              </button>

              <button
                onClick={handleShareCertificate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <Share2 size={18} />
                Share Certificate
              </button>

              <button
                onClick={() => {
                  setShowModal(false);
                  onClose?.();
                }}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Complete Course?
            </h2>

            <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You have watched all videos in this course. Mark it as complete to receive your certificate.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCompleteCourse}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors font-semibold"
              >
                {isLoading ? 'Processing...' : 'Mark as Complete'}
              </button>

              <button
                onClick={() => {
                  setShowModal(false);
                  onClose?.();
                }}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});

CourseCompletionModal.displayName = 'CourseCompletionModal';
export default CourseCompletionModal;
