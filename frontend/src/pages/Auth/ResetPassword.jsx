import { memo, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { Button, Input, Alert } from '../../components/UI';
import { useToast } from '../../hooks/useToast';

const ResetPassword = memo(() => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

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

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }
      );
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [formData, token, validateForm, navigate]);

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
          <h1 className={`text-3xl font-bold ${textClass}`}>Create New Password</h1>
          <p className={`text-sm ${secondaryText} mt-2`}>Enter your new password below</p>
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

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword}
            />

            <div className={`text-xs ${secondaryText} p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              Password must contain:
              <ul className="mt-2 space-y-1">
                <li>✓ At least 8 characters</li>
                <li>✓ One uppercase letter</li>
                <li>✓ One lowercase letter</li>
                <li>✓ One number</li>
                <li>✓ One special character (@$!%*?&)</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="full"
              loading={isLoading}
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </form>
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

ResetPassword.displayName = 'ResetPassword';
export default ResetPassword;
