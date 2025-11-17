import { memo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle } from 'lucide-react';
import { uploadVideo } from '../store/courseSlice';

const VideoUploadComponent = memo(({ courseId, moduleId, onClose }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { isLoading } = useSelector((state) => state.courses);
  const isDark = mode === 'dark';

  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setUploadProgress(0);
      setUploadSuccess(false);
    } else {
      alert('Please select a valid video file');
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!videoFile || !videoTitle) {
      alert('Please select a video file and enter a title');
      return;
    }

    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('title', videoTitle);
    formData.append('description', videoDescription);
    formData.append('isDemo', isDemo);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;
      setUploadProgress(Math.floor(progress));
    }, 500);

    try {
      await dispatch(uploadVideo({ courseId, moduleId, formData })).unwrap();
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setVideoFile(null);
        setVideoTitle('');
        setVideoDescription('');
        setIsDemo(false);
        setUploadProgress(0);
        setUploadSuccess(false);
        onClose?.();
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
      alert('Upload failed: ' + error);
    }
  }, [videoFile, videoTitle, videoDescription, isDemo, courseId, moduleId, dispatch, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={(e) => e.stopPropagation()}
      className={`${bgClass} rounded-lg p-6 max-w-md w-full`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${textClass}`}>Upload Video</h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className={`p-1 rounded-lg ${hoverClass} transition-colors cursor-pointer`}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {uploadSuccess ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className={`${textClass} font-semibold`}>Video uploaded successfully!</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Redirecting...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Video File Input */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Video File *</label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              videoFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : `border-gray-300 dark:border-gray-600 ${hoverClass}`
            }`}>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-input"
                disabled={isLoading}
              />
              <label htmlFor="video-input" className="cursor-pointer block">
                {videoFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className={`text-sm font-medium ${textClass}`}>{videoFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${textClass}`}>Click to upload video</span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>MP4, WebM, or other video formats</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Video Title */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Video Title *</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g., Introduction to Hooks"
              required
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
            />
          </div>

          {/* Video Description */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>Description</label>
            <textarea
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              placeholder="Optional description..."
              rows="2"
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50`}
            />
          </div>

          {/* Demo Video Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is-demo"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="is-demo" className={`text-sm font-medium ${textClass} cursor-pointer`}>
              This is a demo/preview video (available to all users)
            </label>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>
              <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !videoFile || !videoTitle}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Uploading...' : 'Upload Video'}
            </motion.button>
          </div>
        </form>
      )}
    </motion.div>
  );
});

VideoUploadComponent.displayName = 'VideoUploadComponent';
export default VideoUploadComponent;
