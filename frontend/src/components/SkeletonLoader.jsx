import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export function SkeletonCard() {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-gray-200';

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`${bgClass} rounded-lg p-4 space-y-3`}
    >
      <div className={`h-40 ${bgClass} rounded-lg`} />
      <div className={`h-4 ${bgClass} rounded w-3/4`} />
      <div className={`h-4 ${bgClass} rounded w-1/2`} />
    </motion.div>
  );
}

export function SkeletonText({ lines = 3 }) {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-gray-200';

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="space-y-2"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 ${bgClass} rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </motion.div>
  );
}

export function SkeletonProfile() {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-gray-200';

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-20 h-20 ${bgClass} rounded-full`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 ${bgClass} rounded w-1/3`} />
          <div className={`h-4 ${bgClass} rounded w-1/2`} />
        </div>
      </div>
      <div className="space-y-2">
        <div className={`h-4 ${bgClass} rounded w-full`} />
        <div className={`h-4 ${bgClass} rounded w-full`} />
        <div className={`h-4 ${bgClass} rounded w-2/3`} />
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
