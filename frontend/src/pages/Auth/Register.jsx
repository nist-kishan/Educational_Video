import { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserCheck } from 'lucide-react';
import { registerUser, clearError } from '../../store/authSlice';
import { Button, Input, Alert } from '../../components/UI';
import { useToast } from '../../hooks/useToast';

const Register = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoading, error, isAuthenticated, success } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});

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
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // First name validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    else if (formData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) newErrors.firstName = 'First name can only contain letters and spaces';
    
    // Last name validation
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    else if (formData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) newErrors.lastName = 'Last name can only contain letters and spaces';
    
    // Email validation
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please provide a valid email address';
    
    // Password validation
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])/.test(formData.password)) newErrors.password = 'Password must contain at least one lowercase letter';
    else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain at least one number';
    else if (!/(?=.*[@$!%*?&])/.test(formData.password)) newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
    
    // Confirm password validation
    if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
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

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...submitData } = formData;
      dispatch(registerUser(submitData));
    }
  }, [formData, validateForm, dispatch]);

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
          <h1 className={`text-3xl font-bold ${textClass}`}>Create Account</h1>
          <p className={`text-sm ${secondaryText} mt-2`}>Join our learning community</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => dispatch(clearError())}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            icon={User}
            error={errors.firstName}
          />

          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            icon={User}
            error={errors.lastName}
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email}
          />

          <Input
            label="Password"
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

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              I am a:
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border-2 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass} focus:border-blue-500 focus:outline-none transition-colors`}
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="full"
            loading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className={`text-center text-sm ${secondaryText} mt-6`}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
});

Register.displayName = 'Register';
export default Register;
