import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Eye, Calendar } from 'lucide-react';
import axios from 'axios';

const Certificates = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCertificates();
  }, [page]);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/student/certificates?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (certificateId) => {
    try {
      const response = await axios.get(
        `${API_URL}/student/certificates/${certificateId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `certificate-${certificateId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleShare = (certificateNumber) => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificateNumber}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Certificate link copied to clipboard!');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Award size={32} className="text-yellow-500" />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My Certificates
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Award size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No certificates yet
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Complete courses to earn certificates
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-lg border-2 border-yellow-500 cursor-pointer transition-all ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={() => setSelectedCert(cert)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Award size={32} className="text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-500 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
                    Verified
                  </span>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {cert.courses?.name || 'Course Certificate'}
                </h3>

                <div className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} />
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </div>
                  <p className="font-mono text-xs">{cert.certificate_number}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(cert.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(cert.certificate_number);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Certificate Detail Modal */}
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-8 rounded-lg max-w-2xl w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="text-center mb-6">
                <Award size={64} className="mx-auto mb-4 text-yellow-500" />
                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Certificate of Completion
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedCert.courses?.name}
                </p>
              </div>

              <div className={`p-6 rounded-lg mb-6 border-2 border-yellow-500 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This is to certify that
                </p>
                <p className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCert.users?.first_name} {selectedCert.users?.last_name}
                </p>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  has successfully completed the course
                </p>
                <p className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCert.courses?.name}
                </p>
                <div className="border-t pt-4">
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Issued on {new Date(selectedCert.issued_at).toLocaleDateString()}
                  </p>
                  <p className="font-mono text-xs mt-2">{selectedCert.certificate_number}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedCert.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => handleShare(selectedCert.certificate_number)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  <Share2 size={18} />
                  Share
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

Certificates.displayName = 'Certificates';
export default Certificates;
