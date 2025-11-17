import { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, BookOpen, Clock, FileText, TrendingUp, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { getMyEnrollments, clearError, clearSuccess } from '../../store/studentSlice';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { Alert } from '../../components/UI';

const MyEnrollments = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { enrollments, isLoading, error, success, pagination } = useSelector((state) => state.student);
  const isDark = mode === 'dark';
  const [currentPage, setCurrentPage] = useState(1);

  const bgClass = isDark
    ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
  const cardBg = isDark
    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-white to-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    dispatch(getMyEnrollments({ page: currentPage, limit: 12 }));
  }, [dispatch, currentPage]);

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

  const getProgressColor = (progress) => {
    if (progress === 100) return 'from-green-500 to-emerald-600';
    if (progress >= 75) return 'from-blue-500 to-purple-600';
    if (progress >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getProgressLabel = (progress) => {
    if (progress === 100) return 'Completed';
    if (progress >= 75) return 'Almost Done';
    if (progress >= 50) return 'Halfway';
    return 'Just Started';
  };

  if (isLoading && enrollments.length === 0) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonGrid count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              My Courses
            </h1>
          </div>
          <p className={`${secondaryText} text-lg max-w-2xl`}>
            Continue learning and track your progress across all your enrolled courses
          </p>
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

        {/* Empty State */}
        {enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-16 rounded-2xl border-2 border-dashed ${borderClass}`}
          >
            <AlertCircle className={`w-20 h-20 mx-auto mb-4 ${secondaryText}`} />
            <p className={`text-2xl font-bold ${textClass} mb-2`}>No Courses Yet</p>
            <p className={`${secondaryText} mb-8 max-w-md mx-auto`}>
              You haven't enrolled in any courses yet. Start exploring our course catalog to begin your learning journey!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/student/courses')}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow"
            >
              <span>Explore Courses</span>
              <TrendingUp className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {enrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className={`${cardBg} rounded-2xl overflow-hidden border-2 ${borderClass} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
                  onClick={() => navigate(`/student/courses/${enrollment.courses.id}`)}
                >
                  {/* Header */}
                  <div className="relative h-40 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Animated Background */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                    />

                    <div className="relative z-10 h-full flex flex-col justify-between p-5">
                      <div>
                        <h3 className="text-xl font-bold text-white line-clamp-2">{enrollment.courses.name}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/80 text-white">
                          {enrollment.courses.category}
                        </span>
                        {enrollment.progress === 100 && (
                          <CheckCircle className="w-5 h-5 text-green-300" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Description */}
                    <p className={`text-sm ${secondaryText} line-clamp-2`}>
                      {enrollment.courses.description}
                    </p>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-semibold ${secondaryText}`}>Progress</span>
                        <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${getProgressColor(enrollment.progress)}`}>
                          {enrollment.progress}%
                        </span>
                      </div>
                      <div className={`w-full h-3 rounded-full overflow-hidden border ${borderClass}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${enrollment.progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${getProgressColor(enrollment.progress)}`}
                        />
                      </div>
                      <p className={`text-xs ${secondaryText} mt-2`}>{getProgressLabel(enrollment.progress)}</p>
                    </div>

                    {/* Stats */}
                    <div className={`grid grid-cols-3 gap-3 py-3 px-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} border ${borderClass}`}>
                      <div className="text-center">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                        <p className={`text-xs ${secondaryText}`}>Duration</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {Math.floor((enrollment.courses.total_duration || 0) / 60)}h
                        </p>
                      </div>
                      <div className="text-center">
                        <BookOpen className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                        <p className={`text-xs ${secondaryText}`}>Videos</p>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {enrollment.courses.videos_count || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <FileText className="w-4 h-4 mx-auto mb-1 text-pink-500" />
                        <p className={`text-xs ${secondaryText}`}>Tasks</p>
                        <p className="text-sm font-bold text-pink-600 dark:text-pink-400">
                          {enrollment.courses.assignments_count || 0}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/course/${enrollment.courses.id}/video`);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 text-white font-semibold transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span>Continue Learning</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex justify-center items-center space-x-2 p-6 rounded-2xl border ${cardBg} ${borderClass}`}
              >
                <span className={`text-sm font-semibold ${secondaryText} mr-4`}>
                  Page {currentPage} of {pagination.pages}
                </span>
                <div className="flex gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                          : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

MyEnrollments.displayName = 'MyEnrollments';
export default MyEnrollments;
