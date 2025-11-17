import { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const Alert = memo(({
  type = 'error',
  message,
  onClose,
  autoClose = true
}) => {
  const types = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start space-x-3`}
    >
      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${config.text}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`${config.color} hover:opacity-70 transition-opacity`}
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
});

Alert.displayName = 'Alert';
export default Alert;
