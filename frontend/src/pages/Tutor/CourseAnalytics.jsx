import { memo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BarChart3, Users, DollarSign, TrendingUp, Eye, Star, Download, Calendar } from 'lucide-react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CourseAnalytics = memo(() => {
  const { courseId } = useParams();
  const { mode } = useSelector((state) => state.theme);
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState({
    enrollment: [],
    revenue: [],
    completion: [],
    videoViews: []
  });
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAnalytics();
  }, [courseId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/student/courses/${courseId}/analytics?range=${dateRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data.analytics);
      generateChartData(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (data) => {
    // Generate sample data based on date range
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
    const enrollmentData = [];
    const revenueData = [];
    const completionData = [];
    const videoViewsData = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      enrollmentData.push({
        date: dateStr,
        enrollments: Math.floor(Math.random() * 50) + 10,
        cumulative: Math.floor(Math.random() * 500) + 100
      });

      revenueData.push({
        date: dateStr,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        cumulative: Math.floor(Math.random() * 50000) + 10000
      });

      completionData.push({
        date: dateStr,
        completed: Math.floor(Math.random() * 30) + 5,
        inProgress: Math.floor(Math.random() * 40) + 10
      });

      videoViewsData.push({
        date: dateStr,
        views: Math.floor(Math.random() * 1000) + 100
      });
    }

    setChartData({
      enrollment: enrollmentData,
      revenue: revenueData,
      completion: completionData,
      videoViews: videoViewsData
    });
  };

  const handleExportData = () => {
    const csvContent = [
      ['Date', 'Enrollments', 'Revenue', 'Completion Rate', 'Video Views'],
      ...chartData.enrollment.map((item, idx) => [
        item.date,
        item.enrollments,
        chartData.revenue[idx]?.revenue || 0,
        completionData[idx]?.completed || 0,
        chartData.videoViews[idx]?.views || 0
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${courseId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
        <div className="max-w-6xl mx-auto">
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
        <div className="max-w-6xl mx-auto">
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No analytics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-500" />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Course Analytics
            </h1>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Enrollments"
            value={analytics.enrollments || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${(analytics.revenue || 0).toFixed(2)}`}
            color="bg-green-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Completion Rate"
            value={`${analytics.completionRate || 0}%`}
            color="bg-purple-500"
          />
          <StatCard
            icon={Star}
            label="Average Rating"
            value={analytics.avgRating || 0}
            color="bg-yellow-500"
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={analytics.totalViews || 0}
            color="bg-pink-500"
          />
          <StatCard
            icon={BarChart3}
            label="Course Status"
            value={analytics.courseStatus || 'Draft'}
            color="bg-indigo-500"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Enrollment Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Enrollment Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.enrollment}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Completion & Video Views Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Completion Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.completion}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" />
                  <Bar dataKey="inProgress" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Video Views Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Video Views
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.videoViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className={`p-6 rounded-lg mt-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Course Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Enrollment Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Enrolled</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics.enrollments || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Completed</span>
                  <span className={`font-bold text-green-500`}>
                    {Math.round((analytics.enrollments || 0) * (analytics.completionRate || 0) / 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>In Progress</span>
                  <span className={`font-bold text-blue-500`}>
                    {Math.round((analytics.enrollments || 0) * (100 - (analytics.completionRate || 0)) / 100)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Revenue Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Revenue</span>
                  <span className={`font-bold text-green-500 text-lg`}>
                    ${(analytics.revenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg per Student</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${((analytics.revenue || 0) / (analytics.enrollments || 1)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Course Status</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                    analytics.courseStatus === 'published'
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {analytics.courseStatus || 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Completion Rate</span>
                  <span className={`font-bold text-purple-500 text-lg`}>
                    {analytics.completionRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Average Rating</span>
                  <span className={`font-bold text-yellow-500 text-lg`}>
                    {analytics.avgRating || 0} ⭐
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Views</span>
                  <span className={`font-bold text-pink-500 text-lg`}>
                    {analytics.totalViews || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Course Name
              </h3>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.courseName || 'Course'}
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-center">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
});

CourseAnalytics.displayName = 'CourseAnalytics';
export default CourseAnalytics;
