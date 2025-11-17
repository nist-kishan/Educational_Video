import { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, BookOpen, Clock, FileText } from 'lucide-react';
import { getTutorCourses, deleteCourse, clearError, clearSuccess } from '../../store/courseSlice';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { Alert } from '../../components/UI';

const Courses = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { courses, isLoading, error, success } = useSelector((state) => state.courses);
  const isDark = mode === 'dark';

  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(getTutorCourses());
  }, [dispatch]);

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

  const handleDelete = useCallback((courseId) => {
    dispatch(deleteCourse(courseId));
    setDeleteConfirm(null);
  }, [dispatch]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className={`text-3xl font-bold ${textClass}`}>My Courses</h1>
            <p className={`${secondaryText} mt-2`}>Manage your courses and content</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tutor/courses/create-wizard')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Create Course</span>
          </motion.button>
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

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 rounded-lg border-2 border-dashed ${borderClass}`}
          >
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${secondaryText}`} />
            <p className={`text-lg font-semibold ${textClass} mb-2`}>No courses yet</p>
            <p className={`${secondaryText} mb-6`}>Create your first course to get started</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tutor/courses/create-wizard')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Course</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${cardBg} rounded-lg overflow-hidden border ${borderClass} hover:shadow-lg transition-shadow`}
              >
                {/* Course Header */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 p-4 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white line-clamp-2">{course.name}</h3>
                </div>

                {/* Course Body */}
                <div className="p-4 space-y-4">
                  {/* Price & Status */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-sm ${secondaryText}`}>Price</p>
                      <p className="text-2xl font-bold text-green-500">
                        ${course.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-700">
                    <div className="text-center">
                      <p className={`text-sm ${secondaryText}`}>Videos</p>
                      <p className="text-lg font-bold text-blue-500">{course.total_videos}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm ${secondaryText}`}>Assignments</p>
                      <p className="text-lg font-bold text-purple-500">{course.total_assignments}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm ${secondaryText}`}>Duration</p>
                      <p className="text-lg font-bold text-orange-500">
                        {formatDuration(course.total_duration)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm ${secondaryText} line-clamp-2`}>
                    {course.description}
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/tutor/courses/${course.id}`)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg ${
                        isDark ? 'bg-blue-900/30 hover:bg-blue-900/50' : 'bg-blue-100 hover:bg-blue-200'
                      } text-blue-600 dark:text-blue-400 font-semibold transition-colors cursor-pointer`}
                      title="View/Edit Course"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/tutor/courses/${course.id}/edit`)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg ${
                        isDark ? 'bg-purple-900/30 hover:bg-purple-900/50' : 'bg-purple-100 hover:bg-purple-200'
                      } text-purple-600 dark:text-purple-400 font-semibold transition-colors cursor-pointer`}
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(course.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg ${
                        isDark ? 'bg-red-900/30 hover:bg-red-900/50' : 'bg-red-100 hover:bg-red-200'
                      } text-red-600 dark:text-red-400 font-semibold transition-colors cursor-pointer`}
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${cardBg} rounded-lg p-6 max-w-md w-full`}
            >
              <h3 className={`text-xl font-bold ${textClass} mb-4`}>Delete Course?</h3>
              <p className={`${secondaryText} mb-6`}>
                This action cannot be undone. All videos and assignments will be deleted.
              </p>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors cursor-pointer ${
                    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

Courses.displayName = 'Courses';
export default Courses;
