import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, Send, Trash2, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const AssignmentSubmission = memo(({ assignmentId, courseId }) => {
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [submissions, setSubmissions] = useState([]);
  const [submissionText, setSubmissionText] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/assignments/${assignmentId}/submissions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(response.data.submissions || []);
      setIsSubmitted(response.data.submissions?.length > 0);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('submissionText', submissionText);
      if (file) formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/student/assignments/${assignmentId}/submit`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      setSubmissions([response.data.submission, ...submissions]);
      setSubmissionText('');
      setFile(null);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Assignment Submission
      </h3>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Your Submission
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Write your assignment submission here..."
              rows="6"
              className={`w-full px-3 py-2 rounded border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Upload File (Optional)
            </label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
              isDark ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'
            }`}>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-blue-500" size={24} />
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <Send size={16} />
            {isLoading ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </form>
      ) : (
        <div className={`p-4 rounded-lg mb-8 flex items-center gap-3 ${
          isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
        }`}>
          <CheckCircle size={20} />
          <p>You have already submitted this assignment</p>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        <h4 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Your Submissions
        </h4>
        {submissions.map((submission) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                submission.status === 'graded'
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {submission.status}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {submission.submission_text}
            </p>
            {submission.grade && (
              <div className="mt-3 p-2 bg-blue-500 text-white rounded">
                <p className="text-sm font-semibold">Grade: {submission.grade}</p>
                {submission.feedback && <p className="text-sm">{submission.feedback}</p>}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
});

AssignmentSubmission.displayName = 'AssignmentSubmission';
export default AssignmentSubmission;
