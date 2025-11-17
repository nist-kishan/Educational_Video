import { memo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const StatCard = memo(({ icon: Icon, label, value, color }) => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${cardBg} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:border-blue-500 transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${secondaryText} mb-1`}>{label}</p>
          <p className={`text-3xl font-bold ${textClass}`}>{value}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';
export default StatCard;
