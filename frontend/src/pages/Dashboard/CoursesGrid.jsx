import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CourseCard from './CourseCard';

const CoursesGrid = memo(({ courses }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    console.log('👀 Viewing all courses');
    navigate('/student/courses');
  };

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Your Courses</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleViewAll}
          className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
        >
          View All →
        </motion.button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {courses.map((course, i) => (
          <motion.div key={course.id} variants={itemVariants}>
            <CourseCard course={course} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
});

CoursesGrid.displayName = 'CoursesGrid';
export default CoursesGrid;
