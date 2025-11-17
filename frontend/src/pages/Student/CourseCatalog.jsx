import { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Heart, ShoppingCart, Star, Users, Clock, X, ChevronDown, TrendingUp } from 'lucide-react';
import { getAllPublishedCourses, clearError, clearSuccess, addToWishlist, addToCart } from '../../store/studentSlice';
import { SkeletonGrid } from '../../components/SkeletonLoader';
import { Alert } from '../../components/UI';

const CourseCatalog = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { courses, isLoading, error, success, pagination } = useSelector((state) => state.student);
  const isDark = mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced color scheme
  const bgClass = isDark 
    ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
  const cardBg = isDark 
    ? 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800' 
    : 'bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark 
    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const filterBg = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const categories = ['Web Development', 'Mobile Development', 'Data Science', 'UI/UX Design', 'DevOps', 'Cloud Computing'];

  // Fetch courses on mount and when filters change
  useEffect(() => {
    dispatch(getAllPublishedCourses({
      search: searchTerm,
      category: selectedCategory,
      page: currentPage,
      limit: 12
    }));
  }, [dispatch, searchTerm, selectedCategory, currentPage]);

  // Clear alerts
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

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  }, [selectedCategory]);

  const handleCourseClick = useCallback((courseId) => {
    navigate(`/student/courses/${courseId}`);
  }, [navigate]);

  if (isLoading && courses.length === 0) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonGrid count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-8 sm:py-12`}>
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
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className={`text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600`}>
              Explore Courses
            </h1>
          </div>
          <p className={`${secondaryText} text-lg max-w-2xl`}>
            Discover and learn from our collection of expertly-crafted courses. Start your learning journey today!
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

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`mb-10 p-6 sm:p-8 rounded-2xl border ${filterBg} ${borderClass} shadow-lg backdrop-blur-sm`}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative group">
              <Search className={`absolute left-4 top-4 w-5 h-5 ${secondaryText} group-focus-within:text-blue-500 transition-colors`} />
              <input
                type="text"
                placeholder="Search courses by name or topic..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${inputBg} focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
              />
            </div>
          </div>

          {/* Category Filter - Desktop */}
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-blue-500" />
              <span className={`text-sm font-semibold ${textClass}`}>Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category Filter - Mobile */}
          <div className="sm:hidden">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 ${filterBg} ${borderClass} font-semibold ${textClass}`}
            >
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-blue-500" />
                <span>Filter by Category</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleCategoryChange(category);
                        setShowFilters(false);
                      }}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Filters */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center space-x-2"
            >
              <span className={`text-sm ${secondaryText}`}>Active filter:</span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400`}
              >
                <span>{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 rounded-lg border-2 border-dashed ${borderClass}`}
          >
            <Search className={`w-16 h-16 mx-auto mb-4 ${secondaryText}`} />
            <p className={`text-lg font-semibold ${textClass} mb-2`}>No courses found</p>
            <p className={`${secondaryText}`}>Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className={`${cardBg} rounded-2xl overflow-hidden border-2 ${borderClass} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* Course Header with Gradient */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Animated Background Elements */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                    />
                    
                    <div className="relative z-10 h-full flex flex-col justify-between p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-white line-clamp-2 leading-tight">{course.name}</h3>
                        <motion.button
                          whileHover={{ scale: 1.3, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAuthenticated) {
                              navigate('/login');
                              return;
                            }
                            dispatch(addToWishlist(course.id));
                          }}
                          className="text-white hover:text-red-300 transition-colors flex-shrink-0"
                        >
                          <Heart className="w-6 h-6 fill-current" />
                        </motion.button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                          course.price === 0 || course.price === '0'
                            ? 'bg-green-500/80 text-white'
                            : 'bg-blue-500/80 text-white'
                        }`}>
                          {course.price === 0 || course.price === '0' ? '🎁 Free' : `₹${parseFloat(course.price).toFixed(0)}`}
                        </span>
                        <div className="flex items-center space-x-1 text-yellow-300">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-bold">4.5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Body */}
                  <div className="p-5 space-y-4">
                    {/* Category Badge */}
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                      <p className={`text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400`}>
                        {course.category}
                      </p>
                    </div>

                    {/* Description */}
                    <p className={`text-sm ${secondaryText} line-clamp-2 leading-relaxed`}>
                      {course.description}
                    </p>

                    {/* Stats with Icons */}
                    <div className={`grid grid-cols-3 gap-3 py-4 px-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-100/50'} border ${borderClass}`}>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <Clock className="w-4 h-4 text-blue-500" />
                          </div>
                        </div>
                        <p className={`text-xs ${secondaryText}`}>Duration</p>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {Math.floor((course.total_duration || 0) / 60)}h
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <Users className="w-4 h-4 text-purple-500" />
                          </div>
                        </div>
                        <p className={`text-xs ${secondaryText}`}>Videos</p>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {course.total_videos || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <div className="p-2 rounded-lg bg-pink-500/20">
                            <Star className="w-4 h-4 text-pink-500" />
                          </div>
                        </div>
                        <p className={`text-xs ${secondaryText}`}>Rating</p>
                        <p className="text-sm font-bold text-pink-600 dark:text-pink-400">4.5★</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            navigate('/login');
                            return;
                          }
                          dispatch(addToWishlist(course.id));
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border-2 ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-600 text-gray-300' 
                            : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700'
                        } font-semibold transition-all`}
                      >
                        <Heart className="w-4 h-4" />
                        <span className="hidden sm:inline">Save</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            navigate('/login');
                            return;
                          }
                          dispatch(addToCart(course.id));
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 text-white font-semibold transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Cart</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex justify-center items-center space-x-2 p-6 rounded-2xl border ${filterBg} ${borderClass}`}
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

CourseCatalog.displayName = 'CourseCatalog';
export default CourseCatalog;
