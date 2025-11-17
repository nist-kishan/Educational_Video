import { memo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const isDark = mode === 'dark';

  const bgClass = isDark
    ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  const features = [
    {
      icon: BookOpen,
      title: 'Expert Courses',
      description: 'Industry-leading curriculum designed by professionals'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Learn with thousands of students worldwide'
    },
    {
      icon: Zap,
      title: 'Fast Learning',
      description: 'Structured courses for quick skill acquisition'
    },
    {
      icon: Award,
      title: 'Certifications',
      description: 'Earn recognized certificates upon completion'
    }
  ];

  return (
    <div className={`min-h-screen ${bgClass} py-12`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            About EduVid
          </h1>
          <p className={`text-xl ${secondaryText} max-w-3xl mx-auto`}>
            Empowering learners worldwide with high-quality educational content and expert instruction
          </p>
        </motion.div>

        {/* Founder Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`mb-16 p-8 sm:p-12 rounded-2xl border ${cardBg} ${borderClass} shadow-lg`}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Founder Info */}
            <div>
              <h2 className={`text-3xl font-bold ${textClass} mb-4`}>Meet Our Founder</h2>
              <div className={`text-lg ${secondaryText} space-y-3 leading-relaxed`}>
                <p>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Kishan Raj</span> is the visionary founder behind EduVid. 
                  A passionate educator and tech enthusiast, Kishan graduated from <span className="font-semibold">NIT Silchar</span> with a 
                  <span className="font-semibold"> B.Tech in Computer Science Engineering (2021-2025)</span>.
                </p>
                <p>
                  With a deep commitment to making quality education accessible to everyone, Kishan founded EduVid to bridge the gap 
                  between theoretical knowledge and practical skills. His vision is to empower millions of learners globally through 
                  expertly-crafted courses and personalized learning experiences.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active Students', value: '10K+' },
                { label: 'Courses', value: '50+' },
                { label: 'Instructors', value: '25+' },
                { label: 'Countries', value: '45+' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`p-6 rounded-xl border ${cardBg} ${borderClass} text-center`}
                >
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    {stat.value}
                  </p>
                  <p className={`text-sm ${secondaryText} mt-2`}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mb-16 p-8 sm:p-12 rounded-2xl border ${cardBg} ${borderClass} shadow-lg`}
        >
          <h2 className={`text-3xl font-bold ${textClass} mb-6 text-center`}>Our Mission</h2>
          <p className={`text-lg ${secondaryText} text-center max-w-3xl mx-auto leading-relaxed`}>
            At EduVid, we believe that quality education should be accessible to everyone, regardless of their background or location. 
            We're committed to providing industry-leading courses that combine theoretical knowledge with practical skills, helping learners 
            achieve their career goals and unlock their full potential in the digital world.
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className={`text-3xl font-bold ${textClass} mb-10 text-center`}>Why Choose EduVid?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`p-6 rounded-xl border ${cardBg} ${borderClass} text-center hover:shadow-lg transition-shadow`}
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className={`font-bold ${textClass} mb-2`}>{feature.title}</h3>
                  <p className={`text-sm ${secondaryText}`}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center`}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of students learning with EduVid today
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/student/courses')}
            className="inline-flex items-center space-x-2 px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:shadow-lg transition-shadow"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
});

About.displayName = 'About';
export default About;
