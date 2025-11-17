import { supabaseAdmin } from '../config/supabase.js';

// Advanced search
export const advancedSearch = async (req, res) => {
  try {
    const { q, category, priceMin, priceMax, ratingMin, level, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    // Search by query
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by level
    if (level && level !== 'all') {
      query = query.eq('level', level);
    }

    // Filter by price range
    if (priceMin) {
      query = query.gte('price', parseFloat(priceMin));
    }
    if (priceMax) {
      query = query.lte('price', parseFloat(priceMax));
    }

    // Filter by rating
    if (ratingMin) {
      query = query.gte('rating', parseFloat(ratingMin));
    }

    const { data: results, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      results,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: courses, error, count } = await supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .order('total_enrollments', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      courses,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search students (admin)
export const searchStudents = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: students, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'student')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      students,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get search history
export const getSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const { data: history } = await supabaseAdmin
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear search history
export const clearSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('search_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Search history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save search
const saveSearch = async (userId, query) => {
  try {
    await supabaseAdmin.from('search_history').insert([{
      user_id: userId,
      query,
      created_at: new Date()
    }]);
  } catch (error) {
    console.error('Error saving search:', error);
  }
};

export { saveSearch };
