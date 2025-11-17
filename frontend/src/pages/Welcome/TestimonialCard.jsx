import { memo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialCard = memo(({ name, role, image, text }) => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-4xl">{image}</div>
        <div>
          <p className={`font-semibold ${textClass}`}>{name}</p>
          <p className={`text-sm ${secondaryText}`}>{role}</p>
        </div>
      </div>
      <div className="flex mb-3">
        {[...Array(5)].map((_, j) => (
          <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className={secondaryText}>{text}</p>
    </motion.div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';
export default TestimonialCard;
