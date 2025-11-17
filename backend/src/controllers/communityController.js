import { supabaseAdmin } from '../config/supabase.js';

// ==================== COMMENTS ====================

// Create comment on video
export const createComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content, timestamp } = req.body;
    const studentId = req.user.id;

    console.log('💬 Creating comment:', { videoId, studentId });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    // Check if video exists
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Create comment
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('comments')
      .insert({
        video_id: videoId,
        student_id: studentId,
        content: content.trim(),
        timestamp: timestamp || 0,
        likes: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (commentError) throw commentError;

    console.log('✅ Comment created:', comment);

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('❌ Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message
    });
  }
};

// Get video comments
export const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('💬 Fetching comments:', { videoId });

    const { data: comments, error: commentError, count } = await supabaseAdmin
      .from('comments')
      .select('*, users(id, first_name, last_name)', { count: 'exact' })
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (commentError) throw commentError;

    console.log('✅ Comments fetched:', comments?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Comments fetched successfully',
      comments: comments || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

// Like comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const studentId = req.user.id;

    console.log('👍 Liking comment:', { commentId, studentId });

    // Check if already liked
    const { data: existingLike } = await supabaseAdmin
      .from('comment_likes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('student_id', studentId)
      .single();

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this comment'
      });
    }

    // Add like
    const { error: likeError } = await supabaseAdmin
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        student_id: studentId
      });

    if (likeError) throw likeError;

    // Update comment likes count
    const { data: likes } = await supabaseAdmin
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId);

    await supabaseAdmin
      .from('comments')
      .update({ likes: likes?.length || 0 })
      .eq('id', commentId);

    console.log('✅ Comment liked');

    res.status(200).json({
      success: true,
      message: 'Comment liked successfully'
    });
  } catch (error) {
    console.error('❌ Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like comment',
      error: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const studentId = req.user.id;

    console.log('🗑️ Deleting comment:', { commentId, studentId });

    // Verify ownership
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .eq('student_id', studentId)
      .single();

    if (commentError || !comment) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    // Delete
    const { error: deleteError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) throw deleteError;

    console.log('✅ Comment deleted');

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

// ==================== DISCUSSION FORUM ====================

// Create forum thread
export const createThread = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;
    const studentId = req.user.id;

    console.log('📌 Creating thread:', { courseId, studentId });

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Check if enrolled
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course'
      });
    }

    // Create thread
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('forum_threads')
      .insert({
        course_id: courseId,
        student_id: studentId,
        title: title.trim(),
        content: content.trim(),
        views: 0,
        replies: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (threadError) throw threadError;

    console.log('✅ Thread created:', thread);

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      thread
    });
  } catch (error) {
    console.error('❌ Create thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create thread',
      error: error.message
    });
  }
};

// Get course forum threads
export const getCourseThreads = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📌 Fetching threads:', { courseId });

    const { data: threads, error: threadError, count } = await supabaseAdmin
      .from('forum_threads')
      .select('*, users(id, first_name, last_name)', { count: 'exact' })
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (threadError) throw threadError;

    console.log('✅ Threads fetched:', threads?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Threads fetched successfully',
      threads: threads || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threads',
      error: error.message
    });
  }
};

// Reply to thread
export const replyToThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;

    console.log('💬 Replying to thread:', { threadId, studentId });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply cannot be empty'
      });
    }

    // Create reply
    const { data: reply, error: replyError } = await supabaseAdmin
      .from('forum_replies')
      .insert({
        thread_id: threadId,
        student_id: studentId,
        content: content.trim(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (replyError) throw replyError;

    // Update thread reply count
    const { data: replies } = await supabaseAdmin
      .from('forum_replies')
      .select('id')
      .eq('thread_id', threadId);

    await supabaseAdmin
      .from('forum_threads')
      .update({ replies: replies?.length || 0 })
      .eq('id', threadId);

    console.log('✅ Reply created');

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      reply
    });
  } catch (error) {
    console.error('❌ Reply to thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reply to thread',
      error: error.message
    });
  }
};

// Get thread replies
export const getThreadReplies = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('💬 Fetching replies:', { threadId });

    const { data: replies, error: replyError, count } = await supabaseAdmin
      .from('forum_replies')
      .select('*, users(id, first_name, last_name)', { count: 'exact' })
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (replyError) throw replyError;

    console.log('✅ Replies fetched:', replies?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Replies fetched successfully',
      replies: replies || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: error.message
    });
  }
};
