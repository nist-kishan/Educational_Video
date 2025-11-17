import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  User,
  BookOpen,
  ShoppingCart,
  Home,
  Info,
  Bell,
  MessageSquare,
  Heart,
  Award,
  RefreshCw,
  CreditCard,
  Users,
  BarChart3,
  Flag,
  Search,
  Lightbulb,
  MessageCircle,
  ChevronDown,
  Plus,
  Mail,
} from 'lucide-react';
import { toggleTheme } from '../store/themeSlice';
import { logout } from '../store/authSlice';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const profileRef = useRef(null);
  const featuresRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useSelector((state) => state.theme);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.student);
  const cartItemsCount = cart?.items?.length || 0;

  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const hoverClass = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const dropdownBg = isDark ? 'bg-gray-800' : 'bg-white';
  const dropdownBorder = isDark ? 'border-gray-700' : 'border-gray-200';

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (featuresRef.current && !featuresRef.current.contains(event.target)) {
        setIsFeaturesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsFeaturesOpen(false);
  };

  // Feature items by role
  const getFeatureItems = () => {
    const items = [
      { label: 'Advanced Search', path: '/search', icon: <Search className="w-4 h-4" /> },
      { label: 'Recommendations', path: '/recommendations', icon: <Lightbulb className="w-4 h-4" /> },
    ];

    if (isAuthenticated && user?.role === 'student') {
      items.push(
        { label: 'Notifications', path: '/notifications', icon: <Bell className="w-4 h-4" /> },
        { label: 'Messages', path: '/messages', icon: <MessageSquare className="w-4 h-4" /> },
        { label: 'Wishlist', path: '/wishlist', icon: <Heart className="w-4 h-4" /> },
        { label: 'Certificates', path: '/certificates', icon: <Award className="w-4 h-4" /> },
        { label: 'Refund Request', path: '/refund-request', icon: <RefreshCw className="w-4 h-4" /> },
        { label: 'Subscriptions', path: '/subscriptions', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Payment Methods', path: '/payment-methods', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Forum', path: '/forum', icon: <MessageCircle className="w-4 h-4" /> }
      );
    }

    if (isAuthenticated && user?.role === 'tutor') {
      items.push(
        { label: 'My Courses', path: '/tutor/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Students', path: '/tutor/students', icon: <Users className="w-4 h-4" /> }
      );
    }

    if (isAuthenticated && user?.role === 'admin') {
      items.push(
        { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Email Templates', path: '/admin/email-templates', icon: <Mail className="w-4 h-4" /> },
        { label: 'Coupons', path: '/admin/coupons', icon: <Lightbulb className="w-4 h-4" /> },
        { label: 'Refunds', path: '/admin/refunds', icon: <RefreshCw className="w-4 h-4" /> },
        { label: 'Moderation', path: '/admin/moderation', icon: <Flag className="w-4 h-4" /> }
      );
    }

    return items;
  };

  const FeatureItem = ({ label, path, icon }) => {
    const isActive = location.pathname === path;
    return (
      <motion.button
        whileHover={{ x: 5 }}
        onClick={() => handleNavigate(path)}
        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors !cursor-pointer ${
          isActive 
            ? isDark 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-50 text-blue-700' 
            : isDark 
              ? 'text-gray-200 hover:bg-blue-500/20 hover:text-blue-300' 
              : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {React.cloneElement(icon, {
          className: `w-4 h-4 ${isActive && isDark ? 'text-white' : isActive ? 'text-blue-600' : 'currentColor'}`
        })}
        <span>{label}</span>
      </motion.button>
    );
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 border-b ${bgClass} backdrop-blur-md bg-opacity-95 cursor-default`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0 cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer"
            >
              EV
            </motion.div>
            <span className={`text-lg font-bold hidden sm:inline ${textClass}`}>
              EduVid
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                location.pathname === '/dashboard'
                  ? isDark ? 'bg-blue-600 text-white' : 'text-blue-600'
                  : isDark ? 'text-white hover:bg-blue-500/20 hover:text-blue-400' : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/student/courses"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                location.pathname === '/student/courses'
                  ? isDark ? 'bg-blue-600 text-white' : 'text-blue-600'
                  : isDark ? 'text-white hover:bg-blue-500/20 hover:text-blue-400' : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Courses</span>
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                location.pathname === '/about'
                  ? isDark ? 'bg-blue-600 text-white' : 'text-blue-600'
                  : isDark ? 'text-white hover:bg-blue-500/20 hover:text-blue-400' : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>

            {/* Features Dropdown */}
            <div ref={featuresRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                  isFeaturesOpen
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    : isDark ? 'text-white hover:bg-blue-500/20 hover:text-blue-400' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>Features</span>
                <motion.div
                  animate={{ rotate: isFeaturesOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isFeaturesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl border ${dropdownBg} ${dropdownBorder} z-50 max-h-96 overflow-y-auto cursor-default`}
                  >
                    {getFeatureItems().map((item) => (
                      <FeatureItem
                        key={item.path}
                        label={item.label}
                        path={item.path}
                        icon={item.icon}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-lg ${hoverClass} transition-colors cursor-pointer`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            {/* Cart Icon - Students Only */}
            {isAuthenticated && user?.role === 'student' && (
              <Link to="/student/cart" className="relative !cursor-pointer">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg ${hoverClass} transition-colors !cursor-pointer`}
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.button>
                {cartItemsCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartItemsCount}
                  </motion.div>
                )}
              </Link>
            )}

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="hidden sm:flex space-x-2">
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors !cursor-pointer ${
                    isDark ? 'text-white hover:bg-blue-500/20 hover:text-blue-400' : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-shadow !cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center relative" ref={profileRef}>
                {/* Profile Avatar */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white overflow-hidden !cursor-pointer ${
                    user?.avatar_url ? 'bg-gray-200' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  } hover:shadow-lg transition-shadow`}
                  title={user?.first_name || user?.email}
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (user?.first_name || user?.email || 'U')?.charAt(0).toUpperCase()
                  )}
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-12 right-0 w-56 rounded-lg shadow-xl border ${dropdownBg} ${dropdownBorder} overflow-hidden z-50 cursor-default`}
                    >
                      {/* User Info */}
                      <div className={`px-4 py-3 border-b ${dropdownBorder} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {user?.first_name || user?.email || 'User'}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {user?.email}
                        </p>
                        <p className={`text-xs mt-1 px-2 py-1 rounded font-medium ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                          {user?.role?.toUpperCase()}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={() => {
                            handleNavigate('/profile');
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${hoverClass} text-left ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={() => {
                            handleNavigate('/my-courses');
                            setIsProfileOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${hoverClass} text-left ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>My Courses</span>
                        </motion.button>

                        {user?.role === 'tutor' && (
                          <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => {
                              handleNavigate('/tutor/courses');
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${hoverClass} text-left ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Manage Courses</span>
                          </motion.button>
                        )}

                        {user?.role === 'admin' && (
                          <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => {
                              handleNavigate('/admin/');
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${hoverClass} text-left ${isDark ? 'text-blue-300' : 'text-blue-600'}`}
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </motion.button>
                        )}

                        <div className={`border-t ${dropdownBorder} my-2`} />

                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={handleLogout}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${hoverClass} text-left ${isDark ? 'text-red-300' : 'text-red-600'}`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${hoverClass} transition-colors !cursor-pointer`}
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`lg:hidden border-t ${dropdownBorder} py-4 space-y-2`}
            >
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname === '/dashboard'
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    : isDark ? 'text-gray-100 hover:bg-blue-500/20 hover:text-blue-300' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>

              <Link
                to="/student/courses"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname === '/student/courses'
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    : isDark ? 'text-gray-100 hover:bg-blue-500/20 hover:text-blue-300' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Courses
              </Link>

              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname === '/about'
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    : isDark ? 'text-gray-100 hover:bg-blue-500/20 hover:text-blue-300' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                About
              </Link>

              {/* Mobile Features */}
              <div className="px-4 py-2">
                <p className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-200' : 'text-gray-600'} mb-2`}>
                  Features
                </p>
                <div className="space-y-1 pl-2">
                  {getFeatureItems().map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${hoverClass} !cursor-pointer ${isDark ? 'text-gray-100 hover:bg-blue-500/20 hover:text-blue-300' : `${hoverClass} text-gray-900`}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className={`px-4 space-y-2 pt-2 border-t ${dropdownBorder}`}>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors !cursor-pointer ${
                      isDark ? 'text-gray-100 hover:bg-blue-500/20 hover:text-blue-300' : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-shadow !cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
