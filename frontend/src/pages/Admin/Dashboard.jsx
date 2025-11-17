import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, BookOpen, DollarSign, TrendingUp, Settings, LogOut } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/admin/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
          <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  const MenuItem = ({ icon: Icon, label, href }) => (
    <motion.a
      href={href}
      whileHover={{ x: 5 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isDark
          ? 'hover:bg-gray-700 text-gray-300'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </motion.a>
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-r ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        } p-6 min-h-screen`}>
          <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Admin Panel
          </h2>

          <nav className="space-y-2 mb-8">
            <MenuItem icon={TrendingUp} label="Dashboard" href="#" />
            <MenuItem icon={Users} label="Users" href="/admin/users" />
            <MenuItem icon={BookOpen} label="Courses" href="/admin/courses" />
            <MenuItem icon={DollarSign} label="Analytics" href="/admin/analytics" />
            <MenuItem icon={Settings} label="Settings" href="/admin/settings" />
          </nav>

          <div className="border-t pt-4">
            <button className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors w-full">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Platform Overview
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Users"
              value={analytics?.totalUsers || 0}
              color="bg-blue-500"
            />
            <StatCard
              icon={BookOpen}
              label="Total Courses"
              value={analytics?.totalCourses || 0}
              color="bg-green-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Enrollments"
              value={analytics?.totalEnrollments || 0}
              color="bg-purple-500"
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`}
              color="bg-yellow-500"
            />
          </div>

          {/* User Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                User Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Students</span>
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics?.userBreakdown?.students || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Tutors</span>
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics?.userBreakdown?.tutors || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Admins</span>
                  <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics?.userBreakdown?.admins || 0}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  View All Users
                </button>
                <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  View All Courses
                </button>
                <button className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                  View Analytics
                </button>
                <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                  Moderate Content
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';
export default AdminDashboard;
