import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Settings, Save, Bell, Mail, MessageSquare } from 'lucide-react';
import axios from 'axios';

const NotificationPreferences = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [preferences, setPreferences] = useState({
    email_on_enrollment: true,
    email_on_assignment_graded: true,
    email_on_course_completed: true,
    email_on_comment_reply: true,
    email_on_new_course: true,
    email_on_payment: true,
    push_notifications: true,
    in_app_notifications: true,
    notification_frequency: 'immediate'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/notification-preferences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreferences(response.data.preferences || preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
    setSaved(false);
  };

  const handleFrequencyChange = (frequency) => {
    setPreferences({ ...preferences, notification_frequency: frequency });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_URL}/student/notification-preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({ icon: Icon, label, description, value, onChange }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Icon size={20} className="mt-1 text-blue-500" />
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {label}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {description}
            </p>
          </div>
        </div>
        <button
          onClick={onChange}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings size={32} className="text-blue-500" />
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notification Preferences
          </h1>
        </div>

        {/* Email Notifications */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={20} className="text-blue-500" />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Email Notifications
            </h2>
          </div>
          <div className="space-y-4">
            <NotificationToggle
              icon={Bell}
              label="Course Enrollment"
              description="Get notified when you enroll in a new course"
              value={preferences.email_on_enrollment}
              onChange={() => handleToggle('email_on_enrollment')}
            />
            <NotificationToggle
              icon={Bell}
              label="Assignment Graded"
              description="Get notified when your assignment is graded"
              value={preferences.email_on_assignment_graded}
              onChange={() => handleToggle('email_on_assignment_graded')}
            />
            <NotificationToggle
              icon={Bell}
              label="Course Completed"
              description="Get notified when you complete a course"
              value={preferences.email_on_course_completed}
              onChange={() => handleToggle('email_on_course_completed')}
            />
            <NotificationToggle
              icon={Bell}
              label="Comment Replies"
              description="Get notified when someone replies to your comment"
              value={preferences.email_on_comment_reply}
              onChange={() => handleToggle('email_on_comment_reply')}
            />
            <NotificationToggle
              icon={Bell}
              label="New Courses"
              description="Get notified about new courses in your interests"
              value={preferences.email_on_new_course}
              onChange={() => handleToggle('email_on_new_course')}
            />
            <NotificationToggle
              icon={Bell}
              label="Payment Confirmations"
              description="Get notified about payment confirmations"
              value={preferences.email_on_payment}
              onChange={() => handleToggle('email_on_payment')}
            />
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} className="text-green-500" />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              In-App Notifications
            </h2>
          </div>
          <div className="space-y-4">
            <NotificationToggle
              icon={Bell}
              label="Push Notifications"
              description="Receive push notifications on your device"
              value={preferences.push_notifications}
              onChange={() => handleToggle('push_notifications')}
            />
            <NotificationToggle
              icon={Bell}
              label="In-App Notifications"
              description="See notifications in the app notification center"
              value={preferences.in_app_notifications}
              onChange={() => handleToggle('in_app_notifications')}
            />
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notification Frequency
          </h2>
          <div className="space-y-3">
            {[
              { value: 'immediate', label: 'Immediate', description: 'Get notified right away' },
              { value: 'daily', label: 'Daily Digest', description: 'Get a daily summary' },
              { value: 'weekly', label: 'Weekly Digest', description: 'Get a weekly summary' }
            ].map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleFrequencyChange(option.value)}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  preferences.notification_frequency === option.value
                    ? 'bg-blue-500 border-blue-600 text-white'
                    : isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold">{option.label}</p>
                <p className={`text-sm ${
                  preferences.notification_frequency === option.value
                    ? 'text-blue-100'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
          >
            <Save size={18} />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
          {saved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg"
            >
              ✓ Preferences saved successfully!
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationPreferences.displayName = 'NotificationPreferences';
export default NotificationPreferences;
