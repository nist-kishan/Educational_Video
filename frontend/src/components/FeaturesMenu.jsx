import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  Lightbulb,
  Bell,
  MessageSquare,
  Heart,
  Award,
  RefreshCw,
  CreditCard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Flag,
  Zap,
  BookOpen,
  MessageCircle,
} from 'lucide-react';

export default function FeaturesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { mode } = useSelector((state) => state.theme);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const publicFeatures = [
    { label: 'Advanced Search', path: '/search', icon: <Search className="w-4 h-4" /> },
    { label: 'Recommendations', path: '/recommendations', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  const studentFeatures = [
    { label: 'Notifications', path: '/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Wishlist', path: '/wishlist', icon: <Heart className="w-4 h-4" /> },
    { label: 'Certificates', path: '/certificates', icon: <Award className="w-4 h-4" /> },
    { label: 'Refund Request', path: '/refund-request', icon: <RefreshCw className="w-4 h-4" /> },
    { label: 'Subscriptions', path: '/subscriptions', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Payment Methods', path: '/payment-methods', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Forum', path: '/forum', icon: <MessageCircle className="w-4 h-4" /> },
  ];

  const adminFeatures = [
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Email Templates', path: '/admin/email-templates', icon: <Settings className="w-4 h-4" /> },
    { label: 'Coupons', path: '/admin/coupons', icon: <Zap className="w-4 h-4" /> },
    { label: 'Refunds', path: '/admin/refunds', icon: <RefreshCw className="w-4 h-4" /> },
    { label: 'Moderation', path: '/admin/moderation', icon: <Flag className="w-4 h-4" /> },
  ];

  const tutorFeatures = [
    { label: 'My Courses', path: '/tutor/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Create Course', path: '/tutor/courses/create', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Analytics', path: '/tutor/courses/:courseId/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Students', path: '/tutor/students', icon: <Users className="w-4 h-4" /> },
  ];

  const FeatureSection = ({ title, features, icon: Icon }) => (
    <div className="px-4 py-3 border-b border-gray-700">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="w-4 h-4 text-blue-500" />
        <h3 className={`text-sm font-semibold ${textClass}`}>{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${hoverClass} transition-colors`}
          >
            {feature.icon}
            <span>{feature.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${hoverClass}`}
      >
        <span>Features</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border ${bgClass} ${borderClass} z-50 max-h-96 overflow-y-auto`}
          >
            {/* Public Features */}
            <FeatureSection
              title="Discover"
              features={publicFeatures}
              icon={Search}
            />

            {/* Student Features */}
            {isAuthenticated && user?.role === 'student' && (
              <FeatureSection
                title="My Learning"
                features={studentFeatures}
                icon={BookOpen}
              />
            )}

            {/* Admin Features */}
            {isAuthenticated && user?.role === 'admin' && (
              <FeatureSection
                title="Administration"
                features={adminFeatures}
                icon={BarChart3}
              />
            )}

            {/* Tutor Features */}
            {isAuthenticated && user?.role === 'tutor' && (
              <FeatureSection
                title="Teaching"
                features={tutorFeatures}
                icon={BookOpen}
              />
            )}

            {/* Cart for Students */}
            {isAuthenticated && user?.role === 'student' && (
              <div className="px-4 py-3 border-t border-gray-700">
                <Link
                  to="/student/cart"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium ${hoverClass} transition-colors bg-blue-500/20 text-blue-400`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Shopping Cart</span>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
