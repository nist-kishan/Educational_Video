import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }), []);

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${textClass}`}
            >
              Learn <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Anything
              </span>, <br /> Anytime
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className={`text-lg md:text-xl leading-relaxed ${secondaryText}`}
            >
              Unlock your potential with our comprehensive online learning platform. From beginner to expert, we have courses for everyone.
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-6"
          >
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow text-center cursor-pointer"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className={`px-8 py-3 rounded-lg border-2 ${isDark ? 'border-gray-700 text-gray-100 hover:bg-gray-800' : 'border-gray-300 text-gray-900 hover:bg-gray-100'} font-semibold transition-colors text-center cursor-pointer`}
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow text-center flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 pt-12"
          >
            {[
              { number: '10K+', label: 'Courses' },
              { number: '1M+', label: 'Students' },
              { number: '4.9★', label: 'Rating' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className={`text-sm md:text-base ${secondaryText} mt-2`}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          variants={itemVariants}
          className="relative hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-3xl opacity-20" />
            <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl p-8 space-y-4`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                <div>
                  <p className={`font-semibold ${textClass}`}>Live Class</p>
                  <p className={`text-sm ${secondaryText}`}>Starting in 5 min</p>
                </div>
              </div>
              <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                <Play className="w-12 h-12 text-blue-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
