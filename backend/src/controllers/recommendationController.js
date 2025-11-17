import { supabaseAdmin } from '../config/supabase.js';

// Get personalized recommendations
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user's enrolled courses
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('student_id', userId);

    const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];

    // Get user's wishlist
    const { data: wishlist } = await supabaseAdmin
      .from('wishlist')
      .select('course_id')
      .eq('user_id', userId);

    const wishlistCourseIds = wishlist?.map(w => w.course_id) || [];

    // Get courses not enrolled in
    let query = supabaseAdmin
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .limit(parseInt(limit));

    if (enrolledCourseIds.length > 0) {
      query = query.not('id', 'in', `(${enrolledCourseIds.join(',')})`);
    }

    const { data: recommendations } = await query;

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get trending courses
export const getTrendingCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: trending } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('total_enrollments', { ascending: false })
      .limit(parseInt(limit));

    res.status(200).json({ success: true, trending });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get similar courses
export const getSimilarCourses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { limit = 10 } = req.query;

    // Get the course
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Get similar courses by category
    const { data: similar } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('category', course.category)
      .eq('status', 'published')
      .neq('id', courseId)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, similar });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get recommended for you
export const getRecommendedForYou = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user's course history
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('courses(category)')
      .eq('student_id', userId);

    // Get categories from enrolled courses
    const categories = [...new Set(enrollments?.map(e => e.courses?.category) || [])];

    // Get courses in similar categories
    let query = supabaseAdmin
      .from('courses')
      .select('*')
      .eq('status', 'published');

    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    const { data: recommended } = await query.limit(parseInt(limit));

    res.status(200).json({ success: true, recommended });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
