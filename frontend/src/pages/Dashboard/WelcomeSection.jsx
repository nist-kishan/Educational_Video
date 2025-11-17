import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const WelcomeSection = memo(() => {
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const isDark = mode === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  // Handle welcome button click
  const handleWelcomeButtonClick = () => {
    if (user?.role === 'student') {
      console.log('📚 Navigating to course catalog');
      navigate('/student/courses');
    } else if (user?.role === 'tutor') {
      console.log('📝 Navigating to create course');
      navigate('/tutor/create-course');
    } else if (user?.role === 'admin') {
      console.log('📊 Navigating to admin analytics');
      navigate('/admin/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${cardBg} rounded-2xl p-8 mb-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold ${textClass} mb-2`}>
            Welcome back, {user?.first_name || 'User'}! 👋
          </h1>
          <p className={secondaryText}>
            {user?.role === 'student' && "Continue your learning journey and explore new courses"}
            {user?.role === 'tutor' && "Manage your courses and engage with your students"}
            {user?.role === 'admin' && "Monitor platform activity and manage users"}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWelcomeButtonClick}
          className="mt-4 md:mt-0 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow"
        >
          {user?.role === 'student' && 'Browse Courses'}
          {user?.role === 'tutor' && 'Create Course'}
          {user?.role === 'admin' && 'View Analytics'}
        </motion.button>
      </div>
    </motion.div>
  );
});

WelcomeSection.displayName = 'WelcomeSection';
export default WelcomeSection;
