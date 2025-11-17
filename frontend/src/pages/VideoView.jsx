import { memo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Award,
  BarChart3,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getUserProfile } from '../store/authSlice';

const VideoView = memo(() => {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { enrollments = [] } = useSelector((state) => state.student || {});

  const isDark = mode === 'dark';
  const [expandedModule, setExpandedModule] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchStatus, setWatchStatus] = useState({});
  const [markingWatched, setMarkingWatched] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, user]);

  // Fetch course data with modules and videos
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get course details
        const courseResponse = await axios.get(
          `${API_URL}/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const course = courseResponse.data.course;

        // Get modules with videos
        const modulesResponse = await axios.get(
          `${API_URL}/courses/${courseId}/modules`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const modules = modulesResponse.data.modules || [];

        // Get enrollment to track watch status
        const enrollment = enrollments.find(e => e.course_id === parseInt(courseId));
        
        const courseWithModules = {
          ...course,
          modules: modules.map(module => ({
            ...module,
            videos: module.videos || []
          }))
        };

        setCourseData(courseWithModules);
        
        // Set first video as current
        if (modules.length > 0 && modules[0].videos?.length > 0) {
          const firstVideo = modules[0].videos[0];
          setCurrentVideo(firstVideo);
          setExpandedModule(modules[0].id);
        }

        // Fetch watch status for all videos
        if (enrollment) {
          const watchResponse = await axios.get(
            `${API_URL}/student/enrollments/${enrollment.id}/watch-status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setWatchStatus(watchResponse.data.watchStatus || {});
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && token) {
      fetchCourseData();
    }
  }, [courseId, token, enrollments]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading course...</p>
        </div>
      </div>
    );
  }

  // Mark video as watched
  const handleMarkWatched = async () => {
    if (!currentVideo || !courseData) return;

    try {
      setMarkingWatched(true);
      const enrollment = enrollments.find(e => e.course_id === parseInt(courseId));
      
      if (!enrollment) {
        setError('Enrollment not found');
        return;
      }

      await axios.post(
        `${API_URL}/student/enrollments/${enrollment.id}/videos/${currentVideo.id}/watch`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update watch status
      setWatchStatus(prev => ({
        ...prev,
        [currentVideo.id]: true
      }));

      // Update current video
      setCurrentVideo(prev => ({ ...prev, watched: true }));
    } catch (err) {
      console.error('Error marking video as watched:', err);
      setError('Failed to mark video as watched');
    } finally {
      setMarkingWatched(false);
    }
  };

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Course not found</p>
        </div>
      </div>
    );
  }

  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  const totalVideos = courseData.modules.reduce((sum, m) => sum + m.videos.length, 0);
  const watchedVideos = courseData.modules.reduce((sum, m) => sum + m.videos.filter(v => v.watched).length, 0);
  const progress = Math.round((watchedVideos / totalVideos) * 100);

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Header */}
      <div className={`border-b ${borderClass} sticky top-0 z-40 ${cardBg}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className={`text-xl font-bold ${textClass}`}>{courseData.name}</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl overflow-hidden mb-6 border ${borderClass}`}
            >
              <div className="aspect-video bg-black flex items-center justify-center relative group">
                <img
                  src={courseData.thumbnail}
                  alt={currentVideo?.title}
                  className="w-full h-full object-cover"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all"
                >
                  <Play className="w-16 h-16 text-white fill-white" />
                </motion.button>
              </div>
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${cardBg} rounded-xl p-6 border ${borderClass} mb-6`}
            >
              <h2 className={`text-2xl font-bold ${textClass} mb-2`}>
                {currentVideo?.title}
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className={secondaryText}>{currentVideo?.duration} minutes</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${watchStatus[currentVideo?.id] || currentVideo?.watched ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                  {watchStatus[currentVideo?.id] || currentVideo?.watched ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Watched</span>
                    </>
                  ) : (
                    <span>Not watched</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!watchStatus[currentVideo?.id] && !currentVideo?.watched && (
                  <motion.button
                    onClick={handleMarkWatched}
                    disabled={markingWatched}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{markingWatched ? 'Marking...' : 'Mark as Watched'}</span>
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${borderClass} ${textClass} hover:bg-gray-700/50 transition-colors`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Course Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${cardBg} rounded-xl p-6 border ${borderClass}`}
            >
              <h3 className={`text-lg font-semibold ${textClass} mb-3`}>About this course</h3>
              <p className={secondaryText}>{courseData.description}</p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${cardBg} rounded-xl p-6 border ${borderClass} mb-6 sticky top-24`}
            >
              {/* Instructor */}
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src={courseData.instructor_avatar}
                  alt={courseData.instructor}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className={`text-sm ${secondaryText}`}>Instructor</p>
                  <p className={`font-semibold ${textClass}`}>{courseData.instructor}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className={secondaryText}>Rating</span>
                  </div>
                  <span className={`font-semibold ${textClass}`}>{courseData.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className={secondaryText}>Students</span>
                  </div>
                  <span className={`font-semibold ${textClass}`}>{courseData.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className={secondaryText}>Duration</span>
                  </div>
                  <span className={`font-semibold ${textClass}`}>{Math.round(courseData.duration / 60)}h</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${secondaryText}`}>Your Progress</span>
                  <span className={`text-sm font-semibold ${textClass}`}>{progress}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              </div>

              {/* Completion Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                  <p className={`text-2xl font-bold ${textClass}`}>{watchedVideos}</p>
                  <p className={`text-xs ${secondaryText}`}>Watched</p>
                </div>
                <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                  <p className={`text-2xl font-bold ${textClass}`}>{totalVideos}</p>
                  <p className={`text-xs ${secondaryText}`}>Total</p>
                </div>
              </div>
            </motion.div>

            {/* Course Modules */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`${cardBg} rounded-xl border ${borderClass} overflow-hidden`}
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className={`font-semibold ${textClass} flex items-center space-x-2`}>
                  <BookOpen className="w-4 h-4" />
                  <span>Course Content</span>
                </h3>
              </div>

              <div className="divide-y divide-gray-700">
                {courseData.modules.map((module, idx) => (
                  <div key={module.id}>
                    <motion.button
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                      className={`w-full px-4 py-3 flex items-center justify-between hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
                    >
                      <span className={`font-medium ${textClass}`}>{module.title}</span>
                      {expandedModule === module.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </motion.button>

                    {expandedModule === module.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}
                      >
                        {module.videos.map((video) => (
                          <motion.button
                            key={video.id}
                            onClick={() => setCurrentVideo(video)}
                            whileHover={{ x: 4 }}
                            className={`w-full px-6 py-2 text-left flex items-center space-x-3 ${
                              currentVideo?.id === video.id
                                ? 'bg-blue-500/20 border-l-2 border-blue-500'
                                : 'hover:bg-gray-600/50'
                            } transition-colors`}
                          >
                            {watchStatus[video.id] || video.watched ? (
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <Play className="w-4 h-4 text-gray-400" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${textClass}`}>{video.title}</p>
                              <p className={`text-xs ${secondaryText}`}>{video.duration} min</p>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoView.displayName = 'VideoView';
export default VideoView;
