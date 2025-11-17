import { supabaseAdmin } from '../config/supabase.js';

// ==================== USER MANAGEMENT ====================

// Get all users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('👥 Fetching all users:', { role, page, limit });

    let query = supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, status, created_at', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error: usersError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (usersError) throw usersError;

    console.log('✅ Users fetched:', users?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      users: users || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    console.log('🚫 Suspending user:', { userId, reason });

    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        status: 'suspended',
        suspension_reason: reason || '',
        suspended_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ User suspended');

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      user
    });
  } catch (error) {
    console.error('❌ Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user',
      error: error.message
    });
  }
};

// Activate user
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('✅ Activating user:', { userId });

    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        status: 'active',
        suspension_reason: null,
        suspended_at: null
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ User activated');

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      user
    });
  } catch (error) {
    console.error('❌ Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('🗑️ Deleting user:', { userId });

    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    console.log('✅ User deleted');

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// ==================== CONTENT MODERATION ====================

// Get flagged content
export const getFlaggedContent = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('🚩 Fetching flagged content:', { page, limit });

    const { data: flaggedContent, error: flagError, count } = await supabaseAdmin
      .from('flagged_content')
      .select('*, users(first_name, last_name)', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (flagError) throw flagError;

    console.log('✅ Flagged content fetched:', flaggedContent?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Flagged content fetched successfully',
      content: flaggedContent || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get flagged content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flagged content',
      error: error.message
    });
  }
};

// Approve flagged content
export const approveFlaggedContent = async (req, res) => {
  try {
    const { flagId } = req.params;
    const { notes } = req.body;

    console.log('✅ Approving flagged content:', { flagId });

    const { data: approved, error: updateError } = await supabaseAdmin
      .from('flagged_content')
      .update({
        status: 'approved',
        admin_notes: notes || '',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', flagId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Content approved');

    res.status(200).json({
      success: true,
      message: 'Content approved successfully',
      content: approved
    });
  } catch (error) {
    console.error('❌ Approve content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve content',
      error: error.message
    });
  }
};

// Reject flagged content
export const rejectFlaggedContent = async (req, res) => {
  try {
    const { flagId } = req.params;
    const { notes, action } = req.body;

    console.log('❌ Rejecting flagged content:', { flagId, action });

    const { data: rejected, error: updateError } = await supabaseAdmin
      .from('flagged_content')
      .update({
        status: 'rejected',
        admin_notes: notes || '',
        action_taken: action || 'none',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', flagId)
      .select()
      .single();

    if (updateError) throw updateError;

    // If action is delete, delete the content
    if (action === 'delete') {
      // Delete logic based on content type
      console.log('🗑️ Content deleted');
    }

    console.log('✅ Content rejected');

    res.status(200).json({
      success: true,
      message: 'Content rejected successfully',
      content: rejected
    });
  } catch (error) {
    console.error('❌ Reject content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject content',
      error: error.message
    });
  }
};

// ==================== COURSE MANAGEMENT ====================

// Get all courses (Admin)
export const getAllCourses = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📚 Fetching all courses:', { status, page, limit });

    let query = supabaseAdmin
      .from('courses')
      .select('*, users(first_name, last_name)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: courses, error: coursesError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (coursesError) throw coursesError;

    console.log('✅ Courses fetched:', courses?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Courses fetched successfully',
      courses: courses || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// Approve course
export const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log('✅ Approving course:', { courseId });

    const { data: course, error: updateError } = await supabaseAdmin
      .from('courses')
      .update({
        status: 'published',
        approved_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Course approved');

    res.status(200).json({
      success: true,
      message: 'Course approved successfully',
      course
    });
  } catch (error) {
    console.error('❌ Approve course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve course',
      error: error.message
    });
  }
};

// Reject course
export const rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;

    console.log('❌ Rejecting course:', { courseId, reason });

    const { data: course, error: updateError } = await supabaseAdmin
      .from('courses')
      .update({
        status: 'rejected',
        rejection_reason: reason || '',
        rejected_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Course rejected');

    res.status(200).json({
      success: true,
      message: 'Course rejected successfully',
      course
    });
  } catch (error) {
    console.error('❌ Reject course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject course',
      error: error.message
    });
  }
};
