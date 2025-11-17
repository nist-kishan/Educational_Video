import { supabaseAdmin } from '../config/supabase.js';

// Create a course review
export const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, title, comment } = req.body;
    const studentId = req.user.id;

    console.log('⭐ Creating review:', { courseId, rating, studentId });

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if student is enrolled in course
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (enrollmentError || !enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to leave a review'
      });
    }

    // Check if already reviewed
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }

    // Create review
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        course_id: courseId,
        student_id: studentId,
        rating,
        title: title || '',
        comment: comment || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    console.log('✅ Review created:', review);

    // Update course average rating
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('course_id', courseId);

    const avgRating = reviews?.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    await supabaseAdmin
      .from('courses')
      .update({ rating: avgRating })
      .eq('id', courseId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('❌ Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Get course reviews
export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📖 Fetching reviews:', { courseId, page, limit });

    const { data: reviews, error: reviewsError, count } = await supabaseAdmin
      .from('reviews')
      .select('*, users(id, first_name, last_name)', { count: 'exact' })
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewsError) throw reviewsError;

    console.log('✅ Reviews fetched:', reviews?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      reviews: reviews || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const studentId = req.user.id;

    console.log('✏️ Updating review:', { reviewId, studentId });

    // Check ownership
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .eq('student_id', studentId)
      .single();

    if (reviewError || !review) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Update review
    const { data: updatedReview, error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({
        rating: rating || review.rating,
        title: title !== undefined ? title : review.title,
        comment: comment !== undefined ? comment : review.comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Review updated');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('❌ Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.id;

    console.log('🗑️ Deleting review:', { reviewId, studentId });

    // Check ownership
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .eq('student_id', studentId)
      .single();

    if (reviewError || !review) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete review
    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) throw deleteError;

    console.log('✅ Review deleted');

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Get student's review for a course
export const getStudentReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    console.log('🔍 Fetching student review:', { courseId, studentId });

    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (reviewError && reviewError.code !== 'PGRST116') {
      throw reviewError;
    }

    res.status(200).json({
      success: true,
      message: 'Student review fetched',
      review: review || null
    });
  } catch (error) {
    console.error('❌ Get student review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student review',
      error: error.message
    });
  }
};
