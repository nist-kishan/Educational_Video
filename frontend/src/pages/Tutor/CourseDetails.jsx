import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, Play, FileText, Clock, AlertCircle, Upload, File, X } from 'lucide-react';
import {
  getCourseById,
  getCourseVideos,
  getCourseAssignments,
  addVideo,
  deleteVideo,
  addAssignment,
  deleteAssignment,
  publishCourse,
  clearError,
  clearSuccess
} from '../../store/courseSlice';
import { Alert } from '../../components/UI';
import { SkeletonProfile, SkeletonText } from '../../components/SkeletonLoader';

const CourseDetails = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { mode } = useSelector((state) => state.theme);
  const { currentCourse, videos, assignments, isLoading, error, success } = useSelector((state) => state.courses);
  const isDark = mode === 'dark';

  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [videoData, setVideoData] = useState({ title: '', file: null, description: '' });
  const [assignmentData, setAssignmentData] = useState({ title: '', instructions: '', description: '', dueDate: '', attachmentType: 'none', file: null });
  const [assignmentUploadType, setAssignmentUploadType] = useState('none'); // 'none', 'pdf', 'file'
  const fileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);

  useEffect(() => {
    // Only fetch if courseId is not "create" (i.e., it's an existing course)
    if (courseId && courseId !== 'create') {
      dispatch(getCourseById(courseId));
      dispatch(getCourseVideos(courseId));
      dispatch(getCourseAssignments(courseId));
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleAddVideo = useCallback(() => {
    if (videoData.title && videoData.file) {
      // Note: Videos should be added during course creation in CreateCourseWizard
      // This is a placeholder - moduleId is required but not available in CourseDetails
      setConfirmMessage('Videos should be added during course creation. Please use the Create Course wizard.');
      setShowConfirmModal(true);
      setShowVideoModal(false);
    }
  }, [videoData, courseId, dispatch]);

  const handleAddAssignment = useCallback(() => {
    if (assignmentData.title && assignmentData.instructions) {
      // Note: Assignments should be added during course creation in CreateCourseWizard
      // This is a placeholder - moduleId is required but not available in CourseDetails
      setConfirmMessage('Assignments should be added during course creation. Please use the Create Course wizard.');
      setShowConfirmModal(true);
      setShowAssignmentModal(false);
    }
  }, [assignmentData, courseId, dispatch]);

  const handlePublish = useCallback(() => {
    if (videos.length === 0) {
      setConfirmMessage('Add at least one video before publishing');
      setShowConfirmModal(true);
      return;
    }
    dispatch(publishCourse(courseId));
  }, [videos, courseId, dispatch]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading && !currentCourse) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-6xl mx-auto px-4">
          <SkeletonProfile />
          <div className="mt-8 space-y-4">
            <SkeletonText lines={3} />
          </div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-6xl mx-auto px-4">
          <Alert type="error" message="Course not found" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-8 sm:py-12 overflow-x-hidden`}>
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 w-full"
        >
          {/* Top Row: Back Button + Title */}
          <div className="flex items-start gap-2 sm:gap-4 w-full">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tutor/courses')}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors cursor-pointer flex-shrink-0 mt-1`}
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg sm:text-2xl md:text-3xl font-bold ${textClass} break-words`}>{currentCourse.name}</h1>
              <p className={`${secondaryText} mt-1 text-xs sm:text-sm md:text-base`}>Manage your course content</p>
            </div>
          </div>

          {/* Publish Button - Full Width on Mobile */}
          {currentCourse.status === 'draft' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePublish}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer text-sm sm:text-base"
            >
              Publish Course
            </motion.button>
          )}
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Alert type="error" message={error} />
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Alert type="success" message={success} />
          </motion.div>
        )}

        {/* Course Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'} w-full overflow-hidden`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm ${secondaryText}`}>Price</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-500 break-words">${currentCourse.price.toFixed(2)}</p>
            </div>
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm ${secondaryText}`}>Videos</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">{currentCourse.total_videos}</p>
            </div>
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm ${secondaryText}`}>Assignments</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-500">{currentCourse.total_assignments}</p>
            </div>
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm ${secondaryText}`}>Duration</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-500 break-words">{formatDuration(currentCourse.total_duration)}</p>
            </div>
          </div>
        </motion.div>

        {/* Videos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'} w-full overflow-hidden`}
        >
          <div className="flex flex-col gap-3 mb-4 sm:mb-6 w-full">
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${textClass}`}>Videos</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVideoModal(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors cursor-pointer text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              <span>Add Video</span>
            </motion.button>
          </div>

          {videos.length === 0 ? (
            <div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              <Play className={`w-12 h-12 mx-auto mb-3 ${secondaryText}`} />
              <p className={`${textClass} font-semibold mb-2`}>No videos yet</p>
              <p className={secondaryText}>Add videos to your course</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                >
                  <div className="flex-1">
                    <p className={`font-semibold ${textClass}`}>{video.title}</p>
                    <p className={`text-sm ${secondaryText} mt-1`}>Duration: {Math.floor(video.duration / 60)} minutes</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(deleteVideo({ courseId, videoId: video.id }))}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Assignments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-lg p-3 sm:p-4 md:p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} w-full overflow-hidden`}
        >
          <div className="flex flex-col gap-3 mb-4 sm:mb-6 w-full">
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${textClass}`}>Assignments</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAssignmentModal(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors cursor-pointer text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              <span>Add Assignment</span>
            </motion.button>
          </div>

          {assignments.length === 0 ? (
            <div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              <FileText className={`w-12 h-12 mx-auto mb-3 ${secondaryText}`} />
              <p className={`${textClass} font-semibold mb-2`}>No assignments yet</p>
              <p className={secondaryText}>Add assignments to your course</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                >
                  <div className="flex-1">
                    <p className={`font-semibold ${textClass}`}>{assignment.title}</p>
                    <p className={`text-sm ${secondaryText} mt-1 line-clamp-1`}>{assignment.instructions}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(deleteAssignment({ courseId, assignmentId: assignment.id }))}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Video Modal */}
        <AnimatePresence>
          {showVideoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
              onClick={() => setShowVideoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${cardBg} rounded-lg p-6 max-w-md w-full`}
              >
                <h3 className={`text-xl font-bold ${textClass} mb-4`}>Add Video</h3>
                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    placeholder="Video Title"
                    value={videoData.title}
                    onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  
                  {/* Video File Upload */}
                  <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-100/50'} text-center cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => videoFileInputRef.current?.click()}
                  >
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setVideoData({ ...videoData, file });
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      {videoData.file ? (
                        <>
                          <Play className="w-6 h-6 text-blue-500" />
                          <p className={`text-sm font-semibold ${textClass} break-all`}>{videoData.file.name}</p>
                          <p className={`text-xs ${secondaryText}`}>{(videoData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-blue-500" />
                          <p className={`text-sm font-semibold ${textClass}`}>Click to upload video</p>
                          <p className={`text-xs ${secondaryText}`}>MP4, MOV, AVI, MPEG, MKV, WebM (Max 2GB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <textarea
                    placeholder="Description (optional)"
                    value={videoData.description}
                    onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  />
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVideoModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddVideo}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Adding...' : 'Add Video'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assignment Modal */}
        <AnimatePresence>
          {showAssignmentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto"
              onClick={() => setShowAssignmentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${cardBg} rounded-lg p-6 w-full max-w-md my-8`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-xl font-bold ${textClass}`}>Add Assignment</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAssignmentModal(false)}
                    className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Assignment Title"
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base`}
                  />
                  <textarea
                    placeholder="Instructions"
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base`}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                    rows="2"
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base`}
                  />
                  <input
                    type="datetime-local"
                    placeholder="Due Date (optional)"
                    value={assignmentData.dueDate}
                    onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base`}
                  />

                  {/* File Upload Section */}
                  <div className={`p-4 rounded-lg border-2 ${isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-300 bg-gray-100/50'}`}>
                    <p className={`text-sm font-semibold ${textClass} mb-3`}>Attachment (Optional)</p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setAssignmentUploadType('none')}
                          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                            assignmentUploadType === 'none'
                              ? 'bg-purple-600 text-white'
                              : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          None
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setAssignmentUploadType('pdf')}
                          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                            assignmentUploadType === 'pdf'
                              ? 'bg-red-600 text-white'
                              : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          PDF
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setAssignmentUploadType('file')}
                          className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                            assignmentUploadType === 'file'
                              ? 'bg-blue-600 text-white'
                              : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          File
                        </motion.button>
                      </div>

                      {assignmentUploadType !== 'none' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-400'} text-center cursor-pointer hover:opacity-80 transition-opacity`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={assignmentUploadType === 'pdf' ? '.pdf' : '*'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAssignmentData({ ...assignmentData, file, attachmentType: assignmentUploadType });
                              }
                            }}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center space-y-2">
                            {assignmentData.file ? (
                              <>
                                <File className="w-6 h-6 text-green-500" />
                                <p className={`text-xs sm:text-sm font-semibold ${textClass} break-all`}>{assignmentData.file.name}</p>
                                <p className={`text-xs ${secondaryText}`}>{(assignmentData.file.size / 1024).toFixed(2)} KB</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-purple-500" />
                                <p className={`text-xs sm:text-sm font-semibold ${textClass}`}>
                                  Click to upload {assignmentUploadType === 'pdf' ? 'PDF' : 'file'}
                                </p>
                                <p className={`text-xs ${secondaryText}`}>
                                  {assignmentUploadType === 'pdf' ? 'PDF files only' : 'Any file type'}
                                </p>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setAssignmentUploadType('none');
                      setAssignmentData({ title: '', instructions: '', description: '', dueDate: '', attachmentType: 'none', file: null });
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors cursor-pointer text-sm sm:text-base ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddAssignment}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer text-sm sm:text-base"
                  >
                    {isLoading ? 'Adding...' : 'Add Assignment'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
              onClick={() => setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${cardBg} rounded-lg p-6 max-w-md w-full`}
              >
                <h3 className={`text-lg font-bold ${textClass} mb-4`}>Information</h3>
                <p className={`${secondaryText} mb-6 text-sm leading-relaxed`}>{confirmMessage}</p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                      isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    OK
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

CourseDetails.displayName = 'CourseDetails';
export default CourseDetails;
