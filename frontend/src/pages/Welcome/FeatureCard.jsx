import { memo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const FeatureCard = memo(({ icon: Icon, title, description }) => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:border-blue-500 transition-colors`}
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4"
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <h3 className={`text-lg font-semibold ${textClass} mb-2`}>
        {title}
      </h3>
      <p className={secondaryText}>{description}</p>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';
export default FeatureCard;
