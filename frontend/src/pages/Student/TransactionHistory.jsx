import { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Clock, BookOpen, ArrowLeft } from 'lucide-react';
import { getTransactionHistory, clearError, clearSuccess } from '../../store/studentSlice';
import { Alert } from '../../components/UI';

const TransactionHistory = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { transactions, isLoading, error, success } = useSelector((state) => state.student);
  const isDark = mode === 'dark';

  const bgClass = isDark
    ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50';
  const cardBg = isDark
    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-white to-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    dispatch(getTransactionHistory());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  return (
    <div className={`min-h-screen ${bgClass} py-8 sm:py-12`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className={`mb-6 flex items-center space-x-2 ${secondaryText} hover:${textClass} transition-colors`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Transaction History
            </h1>
          </div>
          <p className={`${secondaryText} text-sm sm:text-base`}>
            View your past course purchases and enrollments.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Alert type="error" message={error} />
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Alert type="success" message={success} />
          </motion.div>
        )}

        <div className={`${cardBg} rounded-2xl border ${borderClass} p-4 sm:p-6 lg:p-8`}>
          {isLoading && transactions.length === 0 ? (
            <p className={secondaryText}>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className={secondaryText}>No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-xl border ${borderClass} p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
                >
                  <div>
                    <p className={`text-sm font-semibold ${textClass} mb-1`}>
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className={`text-xs ${secondaryText} mb-2 flex items-center space-x-2`}>
                      <Clock className="w-4 h-4" />
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {order.items && order.items.length > 0 && order.items.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {item.courses?.name || 'Course'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className={`text-lg font-bold ${textClass}`}>
                      ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                    </p>
                    <p
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : order.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {order.status?.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TransactionHistory.displayName = 'TransactionHistory';
export default TransactionHistory;
