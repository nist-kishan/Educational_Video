import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, Play } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeaturesSection = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const features = useMemo(() => [
    {
      icon: BookOpen,
      title: 'Rich Content',
      description: 'Access thousands of courses from expert instructors'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Learn together with millions of students worldwide'
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn recognized certificates upon completion'
    },
    {
      icon: Play,
      title: 'Video Learning',
      description: 'High-quality video lessons at your own pace'
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
      className={`py-32 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
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
            Why Choose EduVid?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className={`text-lg md:text-xl ${secondaryText} max-w-2xl mx-auto`}
          >
            Everything you need to succeed in your learning journey
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={itemVariants}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
export default FeaturesSection;
