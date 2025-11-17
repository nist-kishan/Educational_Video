import { supabaseAdmin } from '../config/supabase.js';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary, getDemoVideo } from '../utils/cloudinary.js';

// Add video to module
export const addVideo = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, url, duration, order } = req.body;
    const tutorId = req.user.id;

    // Validate required fields
    if (!title || !url || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, url, duration'
      });
    }

    // Check course ownership
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, tutor_id, total_duration, total_videos')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor_id !== tutorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only add videos to your own courses'
      });
    }

    // Check module exists
    const { data: module, error: moduleError } = await supabaseAdmin
      .from('modules')
      .select('id')
      .eq('id', moduleId)
      .eq('course_id', courseId)
      .single();

    if (moduleError || !module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get next order if not provided
    let videoOrder = order;
    if (!videoOrder) {
      const { data: videos } = await supabaseAdmin
        .from('videos')
        .select('order_index')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: false })
        .limit(1);

      videoOrder = videos && videos.length > 0 ? videos[0].order_index + 1 : 1;
    }

    // Create video
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .insert({
        course_id: courseId,
        module_id: moduleId,
        title,
        description: description || '',
        video_url: url,
        url: url,
        duration: parseInt(duration), // Duration in seconds
        order_index: videoOrder,
        is_demo: false,
        is_preview: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (videoError) {
      console.error('Video creation error:', videoError);
      return res.status(500).json({
        success: false,
        message: 'Failed to add video',
        error: videoError.message
      });
    }

    // Update course total duration and video count
    const newTotalDuration = (course.total_duration || 0) + parseInt(duration);
    const newTotalVideos = (course.total_videos || 0) + 1;

    await supabaseAdmin
      .from('courses')
      .update({
        total_duration: newTotalDuration,
        total_videos: newTotalVideos,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    res.status(201).json({
      success: true,
      message: 'Video added successfully',
      video,
      courseTotals: {
        total_duration: newTotalDuration,
        total_videos: newTotalVideos
      }
    });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all videos in a module
export const getModuleVideos = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const tutorId = req.user.id;

    // Check course ownership
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('tutor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor_id !== tutorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view videos from your own courses'
      });
    }

    const { data: videos, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Fetch videos error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch videos',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Videos fetched successfully',
      videos: videos || [],
      count: videos?.length || 0
    });
  } catch (error) {
    console.error('Get course videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update video
export const updateVideo = async (req, res) => {
  try {
    const { courseId, moduleId, videoId } = req.params;
    const { title, description, url, duration, order } = req.body;
    const tutorId = req.user.id;

    // Check course ownership
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('tutor_id, total_duration')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor_id !== tutorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update videos in your own courses'
      });
    }

    // Get current video
    const { data: currentVideo, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('module_id', moduleId)
      .single();

    if (videoError || !currentVideo) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (url) updateData.url = url;
    if (duration) updateData.duration = parseInt(duration);
    if (order !== undefined) updateData.order = order;
    updateData.updated_at = new Date().toISOString();

    // Update video
    const { data: updatedVideo, error: updateError } = await supabaseAdmin
      .from('videos')
      .update(updateData)
      .eq('id', videoId)
      .select()
      .single();

    if (updateError) {
      console.error('Video update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update video',
        error: updateError.message
      });
    }

    // Update course total duration if duration changed
    if (duration && duration !== currentVideo.duration) {
      const durationDifference = parseInt(duration) - currentVideo.duration;
      const newTotalDuration = course.total_duration + durationDifference;

      await supabaseAdmin
        .from('courses')
        .update({
          total_duration: newTotalDuration,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId);
    }

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { courseId, moduleId, videoId } = req.params;
    const tutorId = req.user.id;

    // Check course ownership
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('tutor_id, total_duration, total_videos')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor_id !== tutorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete videos from your own courses'
      });
    }

    // Get video details
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('module_id', moduleId)
      .single();

    if (videoError || !video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete video
    const { error: deleteError } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (deleteError) {
      console.error('Video deletion error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete video',
        error: deleteError.message
      });
    }

    // Update course totals
    const newTotalDuration = course.total_duration - video.duration;
    const newTotalVideos = course.total_videos - 1;

    await supabaseAdmin
      .from('courses')
      .update({
        total_duration: newTotalDuration,
        total_videos: newTotalVideos,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
      courseTotals: {
        total_duration: newTotalDuration,
        total_videos: newTotalVideos
      }
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
