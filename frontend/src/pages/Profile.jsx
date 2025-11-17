import { memo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Edit2, Save, X, Lock, Trash2, AlertCircle, CheckCircle, Send, Upload, Camera } from 'lucide-react';
import axios from 'axios';
import { updateUserProfile, changePassword, deleteAccount, resendVerificationEmail, clearError, clearSuccess } from '../store/authSlice';
import { Alert } from '../components/UI';
import { SkeletonProfile, SkeletonText } from '../components/SkeletonLoader';
import { useToast } from '../hooks/useToast';

const Profile = memo(function Profile() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { mode } = useSelector((state) => state.theme);
  const { user, isLoading, error, success } = useSelector((state) => state.auth);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDark ? 'text-gray-400' : 'text-gray-600';

  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deletePassword, setDeletePassword] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUploadProfilePicture(file);
  };

  const handleUploadProfilePicture = async (file) => {
    setIsUploadingPicture(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/upload-profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Profile picture updated successfully!');
        // Update user in Redux store
        dispatch({
          type: 'auth/updateUserProfile/fulfilled',
          payload: response.data.user
        });
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
      setPreviewImage(null);
    } finally {
      setIsUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    dispatch(updateUserProfile(formData));
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    dispatch(changePassword(passwordData));
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(false);
  };

  const handleDeleteAccount = async () => {
    dispatch(deleteAccount(deletePassword));
    setShowDeleteModal(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Show skeleton loading while fetching data
  if (isLoading && !user) {
    return (
      <div className={`min-h-screen ${bgClass} py-12`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonProfile />
          <div className="mt-12 space-y-6">
            <SkeletonText lines={3} />
            <SkeletonText lines={2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-12`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start space-x-3"
          >
            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <button
              onClick={() => dispatch(clearSuccess())}
              className="text-green-600 hover:text-green-700"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Profile Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${cardBg} rounded-2xl p-8 mb-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white overflow-hidden ${
                    user?.avatar_url || previewImage
                      ? 'bg-gray-200'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}
                >
                  {user?.avatar_url || previewImage ? (
                    <img
                      src={previewImage || user?.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user?.first_name || user?.last_name || 'U')?.charAt(0).toUpperCase()
                  )}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPicture}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload profile picture"
                >
                  {isUploadingPicture ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureSelect}
                  className="hidden"
                  disabled={isUploadingPicture}
                />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textClass}`}>{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.first_name || user?.last_name || 'User'}</h1>
                <p className={`text-sm ${secondaryText} capitalize`}>{user?.role} • {user?.email_verified ? '✓ Verified' : '⚠ Not Verified'}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex items-center space-x-2 hover:shadow-lg transition-shadow"
            >
              <Edit2 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${cardBg} rounded-2xl p-8 mb-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <h2 className={`text-xl font-bold ${textClass} mb-6`}>Personal Information</h2>
          
          <div className="space-y-6">
            {/* Name */}
            <motion.div variants={itemVariants}>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              />
            </motion.div>

            {/* Phone */}
            <motion.div variants={itemVariants}>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              />
            </motion.div>

            {/* Bio */}
            <motion.div variants={itemVariants}>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows="4"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass} disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none`}
              />
            </motion.div>

            {/* Save Button */}
            {isEditing && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${cardBg} rounded-2xl p-8 mb-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <h2 className={`text-xl font-bold ${textClass} mb-6`}>Security</h2>
          
          <div className="space-y-4">
            {/* Email Verification Status */}
            <motion.div
              variants={itemVariants}
              className={`p-4 rounded-lg border ${
                user?.email_verified
                  ? isDark ? 'border-green-700/50 bg-green-900/20' : 'border-green-300 bg-green-50'
                  : isDark ? 'border-yellow-700/50 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-50'
              } flex items-center justify-between`}
            >
              <div className="flex items-center space-x-3">
                {user?.email_verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div className="text-left">
                  <p className={`font-medium ${user?.email_verified ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                    Email Verification
                  </p>
                  <p className={`text-sm ${user?.email_verified ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`}>
                    {user?.email_verified ? '✓ Your email is verified' : '⚠ Your email is not verified'}
                  </p>
                </div>
              </div>
              {!user?.email_verified && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch(resendVerificationEmail())}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Sending...' : 'Verify Now'}</span>
                </motion.button>
              )}
            </motion.div>

            {/* Change Password */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPasswordModal(true)}
              className={`w-full p-4 rounded-lg border ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} flex items-center space-x-3 transition-colors`}
            >
              <Lock className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <p className={`font-medium ${textClass}`}>Change Password</p>
                <p className={`text-sm ${secondaryText}`}>Update your password regularly</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${cardBg} rounded-2xl p-8 border-2 border-red-500 border-opacity-30`}
        >
          <h2 className={`text-xl font-bold text-red-600 mb-6`}>Danger Zone</h2>
          
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteModal(true)}
            className="w-full p-4 rounded-lg border-2 border-red-500 border-opacity-50 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 flex items-center space-x-3 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <p className="font-medium text-red-600">Delete Account</p>
              <p className={`text-sm ${secondaryText}`}>Permanently delete your account and all data</p>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${bgClass} rounded-2xl p-8 max-w-md w-full`}
          >
            <h3 className={`text-2xl font-bold ${textClass} mb-6`}>Change Password</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass}`}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors cursor-pointer ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${bgClass} rounded-2xl p-8 max-w-md w-full`}
          >
            <h3 className={`text-2xl font-bold text-red-600 mb-4`}>Delete Account?</h3>
            <p className={`${secondaryText} mb-6`}>
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            
            <div className="mb-6">
              <label className={`block text-sm font-medium ${textClass} mb-2`}>Enter your password to confirm</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textClass}`}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg border font-semibold transition-colors cursor-pointer ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading || !deletePassword}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
});

Profile.displayName = 'Profile';
export default Profile;
