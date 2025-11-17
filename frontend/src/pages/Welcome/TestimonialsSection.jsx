import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import TestimonialCard from './TestimonialCard';

const TestimonialsSection = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const testimonials = useMemo(() => [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      image: '👩‍🎓',
      text: 'EduVid transformed my learning journey. The courses are engaging and the instructors are amazing!'
    },
    {
      name: 'Mike Chen',
      role: 'Tutor',
      image: '👨‍🏫',
      text: 'As a tutor, I love how easy it is to create and manage courses. The platform is intuitive and powerful.'
    },
    {
      name: 'Emma Davis',
      role: 'Student',
      image: '👩‍💼',
      text: 'I completed 5 courses and got hired at my dream company. EduVid really helped me upskill!'
    }
  ], []);

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
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`py-32 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className={`text-lg ${secondaryText}`}
          >
            Join thousands of satisfied learners
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div key={i} variants={itemVariants}>
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});

TestimonialsSection.displayName = 'TestimonialsSection';
export default TestimonialsSection;
