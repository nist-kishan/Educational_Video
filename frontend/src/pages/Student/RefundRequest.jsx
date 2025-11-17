import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { DollarSign, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';

const RefundRequest = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    refundType: 'full'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const refundReasons = [
    'Course not as described',
    'Course quality is poor',
    'Changed my mind',
    'Technical issues',
    'Duplicate purchase',
    'Other'
  ];

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/enrollments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnrollments(response.data.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRefund = async () => {
    if (!selectedEnrollment || !formData.reason) {
      alert('Please select a course and reason');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/student/refunds/request`,
        {
          enrollmentId: selectedEnrollment.id,
          ...formData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedEnrollment(null);
        setFormData({ reason: '', description: '', refundType: 'full' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting refund request:', error);
      alert('Error submitting refund request');
    }
  };

  const getRefundableAmount = () => {
    if (!selectedEnrollment) return 0;
    const daysEnrolled = Math.floor((Date.now() - new Date(selectedEnrollment.enrolledAt)) / (1000 * 60 * 60 * 24));
    const refundPercentage = Math.max(0, 100 - (daysEnrolled * 5)); // 5% per day
    return (selectedEnrollment.price * refundPercentage / 100).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <DollarSign size={32} className="text-blue-500" />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Request a Refund
          </h1>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mb-6 border ${
            isDark
              ? 'bg-blue-900 border-blue-700'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex gap-3">
            <AlertCircle size={20} className={isDark ? 'text-blue-300' : 'text-blue-600'} />
            <div>
              <p className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>
                Refund Policy
              </p>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                We offer refunds within 30 days of purchase. Refund amount decreases by 5% per day after enrollment.
              </p>
            </div>
          </div>
        </motion.div>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 ${
              isDark
                ? 'bg-green-900 border border-green-700'
                : 'bg-green-50 border border-green-200'
            }`}
          >
            <p className={`font-semibold ${isDark ? 'text-green-200' : 'text-green-900'}`}>
              ✓ Refund request submitted successfully!
            </p>
            <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              We'll review your request and process it within 5-7 business days.
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          {/* Select Course */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Course
            </label>
            <select
              value={selectedEnrollment?.id || ''}
              onChange={(e) => {
                const enrollment = enrollments.find(e => e.id === parseInt(e.target.value));
                setSelectedEnrollment(enrollment);
              }}
              className={`w-full px-3 py-2 rounded border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Choose a course...</option>
              {enrollments.map(enrollment => (
                <option key={enrollment.id} value={enrollment.id}>
                  {enrollment.courseName} - ${enrollment.price}
                </option>
              ))}
            </select>
          </div>

          {/* Refund Amount */}
          {selectedEnrollment && (
            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Estimated Refund Amount
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${getRefundableAmount()}
              </p>
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Original price: ${selectedEnrollment.price}
              </p>
            </div>
          )}

          {/* Refund Type */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Refund Type
            </label>
            <div className="space-y-2">
              {['full', 'partial'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="refundType"
                    value={type}
                    checked={formData.refundType === type}
                    onChange={(e) => setFormData({ ...formData, refundType: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {type === 'full' ? 'Full Refund' : 'Partial Refund'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Reason for Refund
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className={`w-full px-3 py-2 rounded border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Select a reason...</option>
              {refundReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Additional Details
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide more details about your refund request..."
              rows="4"
              className={`w-full px-3 py-2 rounded border resize-none ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitRefund}
            disabled={!selectedEnrollment || !formData.reason}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Send size={18} />
            Submit Refund Request
          </button>
        </motion.div>
      </div>
    </div>
  );
});

RefundRequest.displayName = 'RefundRequest';
export default RefundRequest;
