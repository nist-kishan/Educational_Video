import { supabaseAdmin } from '../config/supabase.js';

// ==================== TUTOR ANALYTICS ====================

// Get course analytics (Tutor)
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tutorId = req.user.id;

    console.log('📊 Fetching course analytics:', { courseId, tutorId });

    // Verify tutor owns course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('tutor_id', tutorId)
      .single();

    if (courseError || !course) {
      return res.status(403).json({
        success: false,
        message: 'You can only view analytics for your courses'
      });
    }

    // Get enrollment count
    const { data: enrollments, error: enrollmentError, count: enrollmentCount } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact' })
      .eq('course_id', courseId);

    // Get total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('course_id', courseId);

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Get completion rate
    const { data: completedEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('status', 'completed');

    const completionRate = enrollmentCount > 0
      ? Math.round((completedEnrollments?.length || 0) / enrollmentCount * 100)
      : 0;

    // Get average rating
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('course_id', courseId);

    const avgRating = reviews?.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Get video views
    const { data: videos } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('course_id', courseId);

    const videoIds = videos?.map(v => v.id) || [];
    let totalViews = 0;

    if (videoIds.length > 0) {
      const { data: watches } = await supabaseAdmin
        .from('video_watches')
        .select('*')
        .in('video_id', videoIds);
      totalViews = watches?.length || 0;
    }

    console.log('✅ Analytics fetched');

    res.status(200).json({
      success: true,
      message: 'Analytics fetched successfully',
      analytics: {
        enrollments: enrollmentCount || 0,
        revenue: totalRevenue,
        completionRate,
        avgRating,
        totalViews,
        courseName: course.name,
        courseStatus: course.status
      }
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get tutor dashboard analytics
export const getTutorDashboardAnalytics = async (req, res) => {
  try {
    const tutorId = req.user.id;

    console.log('📊 Fetching tutor dashboard analytics:', { tutorId });

    // Get all courses
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('tutor_id', tutorId);

    const courseIds = courses?.map(c => c.id) || [];

    // Total enrollments
    const { data: enrollments, error: enrollmentError, count: totalEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact' })
      .in('course_id', courseIds);

    // Total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .in('course_id', courseIds);

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Total courses
    const totalCourses = courseIds.length;

    // Average rating
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .in('course_id', courseIds);

    const avgRating = reviews?.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    console.log('✅ Dashboard analytics fetched');

    res.status(200).json({
      success: true,
      message: 'Dashboard analytics fetched successfully',
      analytics: {
        totalCourses,
        totalEnrollments: totalEnrollments || 0,
        totalRevenue,
        avgRating,
        totalReviews: reviews?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
};

// ==================== ADMIN ANALYTICS ====================

// Get platform analytics (Admin)
export const getPlatformAnalytics = async (req, res) => {
  try {
    console.log('📊 Fetching platform analytics');

    // Total users
    const { data: users, error: usersError, count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' });

    // Total courses
    const { data: courses, error: coursesError, count: totalCourses } = await supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact' });

    // Total enrollments
    const { data: enrollments, error: enrollmentsError, count: totalEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact' });

    // Total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount');

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // User breakdown
    const { data: studentCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'student');

    const { data: tutorCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'tutor');

    console.log('✅ Platform analytics fetched');

    res.status(200).json({
      success: true,
      message: 'Platform analytics fetched successfully',
      analytics: {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalRevenue,
        userBreakdown: {
          students: studentCount?.length || 0,
          tutors: tutorCount?.length || 0,
          admins: (totalUsers || 0) - (studentCount?.length || 0) - (tutorCount?.length || 0)
        }
      }
    });
  } catch (error) {
    console.error('❌ Get platform analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform analytics',
      error: error.message
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    console.log('💰 Fetching revenue analytics:', { period });

    // Get orders with dates
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount, created_at');

    // Group by period
    const revenueByPeriod = {};
    orders?.forEach(order => {
      const date = new Date(order.created_at);
      let key;

      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + (order.total_amount || 0);
    });

    console.log('✅ Revenue analytics fetched');

    res.status(200).json({
      success: true,
      message: 'Revenue analytics fetched successfully',
      analytics: revenueByPeriod
    });
  } catch (error) {
    console.error('❌ Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
};
