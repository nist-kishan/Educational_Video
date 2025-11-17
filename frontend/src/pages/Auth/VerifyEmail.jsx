import { memo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { verifyEmail, clearError } from '../../store/authSlice';
import { Button, Alert } from '../../components/UI';
import { useToast } from '../../hooks/useToast';

const VerifyEmail = memo(() => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const { isLoading, error, success } = useSelector((state) => state.auth);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const token = searchParams.get('token');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clear error after showing toast
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success, toast]);

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail(token)).then((result) => {
        if (result.payload) {
          setVerified(true);
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      });
    }
  }, [token, dispatch, navigate]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mx-auto mb-4"
          >
            EV
          </motion.div>
          <h1 className={`text-3xl font-bold ${textClass}`}>Verify Email</h1>
          <p className={`text-sm ${secondaryText} mt-2`}>Confirming your email address</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => dispatch(clearError())}
          />
        )}

        {/* Loading State */}
        {isLoading && !verified && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center mb-6"
          >
            <Mail className="w-16 h-16 text-blue-500" />
          </motion.div>
        )}

        {/* Success State */}
        {verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <p className={`${textClass} font-semibold mb-2`}>Email Verified!</p>
            <p className={`${secondaryText} text-sm`}>
              Your email has been verified successfully. Redirecting to dashboard...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className={`${secondaryText} text-sm mb-6`}>
              The verification link may have expired or is invalid.
            </p>
            <Link to="/login" className="inline-block">
              <Button variant="primary">Back to Login</Button>
            </Link>
          </motion.div>
        )}

        {/* Back Link */}
        {!verified && !isLoading && (
          <Link
            to="/login"
            className="flex items-center justify-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to login</span>
          </Link>
        )}
      </motion.div>
    </div>
  );
});

VerifyEmail.displayName = 'VerifyEmail';
export default VerifyEmail;
