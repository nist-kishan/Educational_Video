import { memo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Award } from 'lucide-react';

const AnalyticsSection = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={`mt-12 ${cardBg} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Learning Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4">
          <Clock className="w-8 h-8 text-blue-500" />
          <div>
            <p className={`text-sm ${secondaryText}`}>Total Hours</p>
            <p className={`text-2xl font-bold ${textClass}`}>156 hrs</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <TrendingUp className="w-8 h-8 text-green-500" />
          <div>
            <p className={`text-sm ${secondaryText}`}>This Week</p>
            <p className={`text-2xl font-bold ${textClass}`}>12 hrs</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Award className="w-8 h-8 text-purple-500" />
          <div>
            <p className={`text-sm ${secondaryText}`}>Completion Rate</p>
            <p className={`text-2xl font-bold ${textClass}`}>68%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

AnalyticsSection.displayName = 'AnalyticsSection';
export default AnalyticsSection;
