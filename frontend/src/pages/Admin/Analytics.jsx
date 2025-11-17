import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BarChart3, Users, BookOpen, DollarSign, TrendingUp, Download, Calendar } from 'lucide-react';
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

const PlatformAnalytics = memo(() => {
  const { mode } = useSelector((state) => state.theme);
  const [analytics, setAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState({
    userBreakdown: [],
    revenueTrend: [],
    courseDistribution: [],
    enrollmentGrowth: []
  });

  const isDark = mode === 'dark';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, revenueRes] = await Promise.all([
        axios.get(
          `${API_URL}/student/admin/analytics?range=${dateRange}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${API_URL}/student/admin/analytics/revenue?range=${dateRange}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setRevenueAnalytics(revenueRes.data.analytics);
      generateChartData(analyticsRes.data.analytics, revenueRes.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (analyticsData, revenueData) => {
    // User breakdown pie chart
    const userBreakdown = [
      { name: 'Students', value: analyticsData?.totalStudents || 0, fill: '#3b82f6' },
      { name: 'Tutors', value: analyticsData?.totalTutors || 0, fill: '#10b981' },
      { name: 'Admins', value: analyticsData?.totalAdmins || 0, fill: '#f59e0b' }
    ];

    // Revenue trend line chart
    const revenueTrend = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 5000) + 1000
    }));

    // Course distribution bar chart
    const courseDistribution = [
      { category: 'Web Dev', courses: 45 },
      { category: 'Mobile', courses: 32 },
      { category: 'Data Science', courses: 28 },
      { category: 'Design', courses: 25 },
      { category: 'Business', courses: 20 }
    ];

    // Enrollment growth line chart
    const enrollmentGrowth = Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      enrollments: Math.floor(Math.random() * 2000) + 1000
    }));

    setChartData({
      userBreakdown,
      revenueTrend,
      courseDistribution,
      enrollmentGrowth
    });
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', analytics?.totalUsers || 0],
      ['Total Courses', analytics?.totalCourses || 0],
      ['Total Enrollments', analytics?.totalEnrollments || 0],
      ['Total Revenue', analytics?.totalRevenue || 0],
      ['Completion Rate', `${analytics?.completionRate || 0}%`]
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
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
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
            </p>
          )}
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
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading analytics...</p>
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
              Platform Analytics
            </h1>
          </div>
          <div className="flex gap-4">
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
              <option value="all">All Time</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={analytics?.totalUsers || 0}
            color="bg-blue-500"
            trend={analytics?.userTrend}
          />
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={analytics?.totalCourses || 0}
            color="bg-green-500"
            trend={analytics?.courseTrend}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Enrollments"
            value={analytics?.totalEnrollments || 0}
            color="bg-purple-500"
            trend={analytics?.enrollmentTrend}
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${(analytics?.totalRevenue || 0).toFixed(2)}`}
            color="bg-yellow-500"
            trend={analytics?.revenueTrend}
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-6 mb-8">
          {/* User Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              User Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.userBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.userBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue Trend Line Chart */}
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
              <LineChart data={chartData.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Course Distribution & Enrollment Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Distribution Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Course Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.courseDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                    }}
                  />
                  <Bar dataKey="courses" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Enrollment Growth Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Enrollment Growth
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.enrollmentGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                    }}
                  />
                  <Line type="monotone" dataKey="enrollments" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              User Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Students</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(analytics?.userBreakdown?.students / analytics?.totalUsers * 100) || 0}%` }}
                    />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics?.userBreakdown?.students || 0}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Tutors</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(analytics?.userBreakdown?.tutors / analytics?.totalUsers * 100) || 0}%` }}
                    />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics?.userBreakdown?.tutors || 0}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Admins</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(analytics?.userBreakdown?.admins / analytics?.totalUsers * 100) || 0}%` }}
                    />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {analytics?.userBreakdown?.admins || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Revenue Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Revenue Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Revenue</span>
                <span className={`font-bold text-lg text-green-500`}>
                  ${(revenueAnalytics?.totalRevenue || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg per Course</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${((revenueAnalytics?.totalRevenue || 0) / (analytics?.totalCourses || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg per Enrollment</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${((revenueAnalytics?.totalRevenue || 0) / (analytics?.totalEnrollments || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Paid Enrollments</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {revenueAnalytics?.paidEnrollments || 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Course Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Course Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Published</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.courseStats?.published || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Draft</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.courseStats?.draft || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg Rating</span>
                <span className={`font-bold text-yellow-500`}>
                  {analytics?.courseStats?.avgRating || 0} ⭐
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Videos</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.courseStats?.totalVideos || 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Engagement Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Engagement Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg Completion Rate</span>
                <span className={`font-bold text-purple-500`}>
                  {analytics?.engagementMetrics?.avgCompletionRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Reviews</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.engagementMetrics?.totalReviews || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Comments</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.engagementMetrics?.totalComments || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Active Users (30d)</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {analytics?.engagementMetrics?.activeUsers30d || 0}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

PlatformAnalytics.displayName = 'PlatformAnalytics';
export default PlatformAnalytics;
