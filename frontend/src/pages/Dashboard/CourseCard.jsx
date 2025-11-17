import { memo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import axios from 'axios';

const CourseCard = memo(({ course, index }) => {
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  // Handle continue learning button
  const handleContinueLearning = () => {
    console.log('🎓 Navigating to course:', course.id);
    navigate(`/student/course/${course.id}/video`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${cardBg} rounded-xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:border-blue-500 transition-all cursor-pointer group`}
    >
      {/* Course Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Play className="w-12 h-12 text-white opacity-80" />
        </motion.div>
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className={`font-semibold ${textClass} mb-2 line-clamp-2`}>
          {course.title}
        </h3>
        <p className={`text-sm ${secondaryText} mb-3`}>
          by {course.instructor}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-4">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className={`text-sm font-medium ${textClass}`}>
            {course.rating}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-xs ${secondaryText}`}>Progress</span>
            <span className={`text-xs font-semibold ${textClass}`}>
              {course.progress}%
            </span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            />
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinueLearning}
          className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-shadow"
        >
          Continue Learning
        </motion.button>
      </div>
    </motion.div>
  );
});

CourseCard.displayName = 'CourseCard';
export default CourseCard;
