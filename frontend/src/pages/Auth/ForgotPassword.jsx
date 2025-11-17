import { memo, useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { Button, Input, Alert } from '../../components/UI';
import { useToast } from '../../hooks/useToast';

const ForgotPassword = memo(() => {
  const toast = useToast();
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clear error after showing toast
      setError('');
    }
  }, [error, toast]);

  useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success, toast]);

  const handleChange = useCallback((e) => {
    setEmail(e.target.value);
    setError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email }
      );
      setSuccess('If an account with that email exists, a password reset link has been sent.');
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset email';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [email]);

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
          <h1 className={`text-3xl font-bold ${textClass}`}>Reset Password</h1>
          <p className={`text-sm ${secondaryText} mt-2`}>Enter your email to receive a reset link</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
          />
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Mail}
            />

            <Button
              type="submit"
              variant="primary"
              size="full"
              loading={isLoading}
              disabled={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 dark:bg-opacity-20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <p className={`${secondaryText} text-sm`}>
              Check your email for a password reset link. The link will expire in 1 hour.
            </p>
          </motion.div>
        )}

        {/* Back Link */}
        <Link
          to="/login"
          className="flex items-center justify-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to login</span>
        </Link>
      </motion.div>
    </div>
  );
});

ForgotPassword.displayName = 'ForgotPassword';
export default ForgotPassword;
