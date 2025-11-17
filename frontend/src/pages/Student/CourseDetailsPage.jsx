import { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  Play,
  Award,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { getCourseDetails, addToWishlist, removeFromWishlist, addToCart, checkout, completePayment } from '../../store/studentSlice';
import { SkeletonProfile, SkeletonText } from '../../components/SkeletonLoader';
import { Alert } from '../../components/UI';

const CourseDetailsPage = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { mode } = useSelector((state) => state.theme);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentCourse, isLoading, error, success } = useSelector((state) => state.student);
  const isDark = mode === 'dark';

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Color scheme
  const bgClass = isDark
    ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
  const cardBg = isDark
    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-white to-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const buttonBg = 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700';

  useEffect(() => {
    if (courseId) {
      dispatch(getCourseDetails(courseId));
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (currentCourse) {
      setIsWishlisted(!!currentCourse.isInWishlist);
    }
  }, [currentCourse]);

  const handleWishlist = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(courseId));
      setIsWishlisted(false);
    } else {
      dispatch(addToWishlist(courseId));
      setIsWishlisted(true);
    }
  }, [isWishlisted, courseId, dispatch, isAuthenticated, navigate]);

  const handleAddToCart = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(addToCart(courseId));
    setIsInCart(true);
  }, [courseId, dispatch, isAuthenticated, navigate]);

  const handleEnroll = useCallback(() => {
    const enroll = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!currentCourse) {
        return;
      }

      if (currentCourse.isEnrolled) {
        navigate('/my-courses');
        return;
      }

      try {
        setIsProcessing(true);

        const priceValue = parseFloat(currentCourse.price || 0);

        if (!priceValue) {
          const result = await dispatch(checkout({
            courseIds: [courseId],
            paymentMethod: 'free'
          })).unwrap();

          if (result.enrollments) {
            navigate('/my-courses');
          }
        } else {
          const result = await dispatch(checkout({
            courseIds: [courseId],
            paymentMethod: 'manual'
          })).unwrap();

          if (result.order) {
            const transactionId = `TXN-${Date.now()}`;
            await dispatch(completePayment({
              orderId: result.order.id,
              transactionId
            })).unwrap();
            navigate('/my-courses');
          }
        }
      } catch (e) {
        console.error('Enrollment error:', e);
      } finally {
        setIsProcessing(false);
      }
    };

    enroll();
  }, [isAuthenticated, currentCourse, courseId, dispatch, navigate]);

  if (isLoading && !currentCourse) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${cardBg} rounded-2xl p-8 text-center border ${borderClass}`}
          >
            <h2 className={`text-2xl font-bold ${textClass} mb-4`}>Course Not Found</h2>
            <p className={secondaryText}>The course you're looking for doesn't exist.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/student/courses')}
              className={`mt-6 px-6 py-2 rounded-lg ${buttonBg} text-white font-semibold`}
            >
              Back to Courses
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-8 sm:py-12`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/student/courses')}
          className={`mb-8 flex items-center space-x-2 ${secondaryText} hover:${textClass} transition-colors`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            {/* Course Header */}
            <div className={`${cardBg} rounded-2xl p-8 border ${borderClass} mb-8 overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full -mr-20 -mt-20" />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <motion.h1
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-4xl font-bold ${textClass} mb-3`}
                    >
                      {currentCourse.name}
                    </motion.h1>
                    <p className={`${secondaryText} text-lg mb-4`}>{currentCourse.description}</p>
                  </div>
                </div>

                {/* Course Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} rounded-lg p-3`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm ${secondaryText}`}>Duration</span>
                    </div>
                    <p className={`font-semibold ${textClass}`}>
                      {currentCourse.total_duration || 0} mins
                    </p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} rounded-lg p-3`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      <span className={`text-sm ${secondaryText}`}>Videos</span>
                    </div>
                    <p className={`font-semibold ${textClass}`}>{currentCourse.total_videos || 0}</p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} rounded-lg p-3`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className={`text-sm ${secondaryText}`}>Assignments</span>
                    </div>
                    <p className={`font-semibold ${textClass}`}>{currentCourse.total_assignments || 0}</p>
                  </div>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} rounded-lg p-3`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className={`text-sm ${secondaryText}`}>Category</span>
                    </div>
                    <p className={`font-semibold ${textClass} truncate`}>{currentCourse.category}</p>
                  </div>
                </div>

                {/* Rating and Students */}
                <div className="flex items-center space-x-6 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className={`text-sm ${secondaryText}`}>(4.8)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm ${secondaryText}`}>1,234 students</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutor Info */}
            {currentCourse.tutor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`${cardBg} rounded-2xl p-8 border ${borderClass} mb-8`}
              >
                <h3 className={`text-2xl font-bold ${textClass} mb-6`}>Instructor</h3>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(currentCourse.tutor.name || 'Instructor')?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={`text-xl font-semibold ${textClass} mb-2`}>{currentCourse.tutor.name || 'Professional Instructor'}</h4>
                    <p className={secondaryText}>{currentCourse.tutor.bio || 'Expert in their field'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Course Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`${cardBg} rounded-2xl p-8 border ${borderClass} mb-8`}
            >
              <h3 className={`text-2xl font-bold ${textClass} mb-6`}>What You'll Learn</h3>
              <div className="space-y-3">
                {currentCourse.syllabus && (Array.isArray(currentCourse.syllabus) ? currentCourse.syllabus : (typeof currentCourse.syllabus === 'string' ? JSON.parse(currentCourse.syllabus) : [])).length > 0 ? (
                  (Array.isArray(currentCourse.syllabus) ? currentCourse.syllabus : JSON.parse(currentCourse.syllabus || '[]')).map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={textClass}>{item}</span>
                    </div>
                  ))
                ) : (
                  <p className={secondaryText}>No syllabus information available</p>
                )}
              </div>
            </motion.div>

            {/* Modules Preview */}
            {currentCourse.modules && currentCourse.modules.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`${cardBg} rounded-2xl p-8 border ${borderClass}`}
              >
                <h3 className={`text-2xl font-bold ${textClass} mb-6`}>Course Modules</h3>
                <div className="space-y-4">
                  {currentCourse.modules.map((module, idx) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} rounded-lg overflow-hidden`}
                    >
                      {/* Module Header - Clickable */}
                      <button
                        onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                        className="w-full p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className={`font-semibold ${textClass} truncate`}>{module.title}</h4>
                          <p className={`text-sm ${secondaryText} truncate`}>{module.description}</p>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedModules[module.id] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        </motion.div>
                      </button>

                      {/* Videos and Assignments - Collapsible */}
                      <AnimatePresence>
                        {expandedModules[module.id] && (module.videos?.length > 0 || module.assignments?.length > 0) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`border-t ${borderClass} p-4 space-y-3 bg-opacity-50`}
                          >
                            {/* Videos */}
                            {module.videos && module.videos.length > 0 && (
                              <div>
                                <p className={`text-xs font-semibold ${secondaryText} uppercase mb-2`}>Videos ({module.videos.length})</p>
                                <div className="space-y-1 pl-4">
                                  {module.videos.map((video) => (
                                    <div key={video.id} className="flex items-center space-x-2">
                                      <Play className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                      <span className={`text-sm ${textClass} truncate`}>{video.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Assignments */}
                            {module.assignments && module.assignments.length > 0 && (
                              <div>
                                <p className={`text-xs font-semibold ${secondaryText} uppercase mb-2`}>Assignments ({module.assignments.length})</p>
                                <div className="space-y-1 pl-4">
                                  {module.assignments.map((assignment) => (
                                    <div key={assignment.id} className="flex items-center space-x-2">
                                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                      <span className={`text-sm ${textClass} truncate`}>{assignment.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Demo Video */}
            {currentCourse.demoVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`${cardBg} rounded-2xl p-8 border ${borderClass} mt-8`}
              >
                <h3 className={`text-2xl font-bold ${textClass} mb-6`}>Preview Video</h3>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={currentCourse.demoVideo.cloudinary_url}
                    title="Demo Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar - Pricing & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className={`${cardBg} rounded-2xl p-8 border ${borderClass} sticky top-24`}>
              {/* Price */}
              <div className="mb-8">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {currentCourse.price === 0 ? 'Free' : `₹${currentCourse.price}`}
                </div>
                <p className={secondaryText}>
                  {currentCourse.price === 0 ? 'Start learning for free' : 'One-time payment'}
                </p>
              </div>

              {/* Status Badge */}
              {currentCourse.isEnrolled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <p className="text-green-500 font-semibold flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Already Enrolled</span>
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                {!currentCourse.isEnrolled && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEnroll}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-lg ${buttonBg} text-white font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-60`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {isProcessing
                        ? 'Processing...'
                        : currentCourse.price === 0
                        ? 'Enroll for Free'
                        : 'Buy Course'}
                    </span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className={`w-full py-3 rounded-lg border-2 ${
                    isWishlisted
                      ? 'border-red-500 bg-red-500/10'
                      : `border-gray-300 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                  } font-semibold flex items-center justify-center space-x-2 transition-all`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </motion.button>
              </div>

              {/* Course Info */}
              <div className={`space-y-4 pt-6 border-t ${borderClass}`}>
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className={`text-sm ${secondaryText}`}>Modules</p>
                    <p className={`font-semibold ${textClass}`}>{currentCourse.modules?.length || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className={`text-sm ${secondaryText}`}>Duration</p>
                    <p className={`font-semibold ${textClass}`}>{currentCourse.total_duration || 0} mins</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <p className={`text-sm ${secondaryText}`}>Students</p>
                    <p className={`font-semibold ${textClass}`}>1,234</p>
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              {currentCourse.prerequisites && (Array.isArray(currentCourse.prerequisites) ? currentCourse.prerequisites : (typeof currentCourse.prerequisites === 'string' ? JSON.parse(currentCourse.prerequisites) : [])).length > 0 && (
                <div className={`mt-6 pt-6 border-t ${borderClass}`}>
                  <h4 className={`font-semibold ${textClass} mb-3`}>Prerequisites</h4>
                  <ul className="space-y-2">
                    {(Array.isArray(currentCourse.prerequisites) ? currentCourse.prerequisites : JSON.parse(currentCourse.prerequisites || '[]')).map((prereq, idx) => (
                      <li key={idx} className={`text-sm ${secondaryText} flex items-start space-x-2`}>
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

CourseDetailsPage.displayName = 'CourseDetailsPage';
export default CourseDetailsPage;
