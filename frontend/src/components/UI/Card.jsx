import { memo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Card = memo(({
  children,
  className = '',
  hover = true,
  onClick,
  ...props
}) => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      onClick={onClick}
      className={`
        ${bgClass} rounded-xl p-6 border
        ${hover ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
export default Card;
