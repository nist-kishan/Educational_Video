import { supabaseAdmin } from '../config/supabase.js';

// Mark video as watched
export const markVideoAsWatched = async (req, res) => {
  try {
    const { enrollmentId, videoId } = req.params;
    const studentId = req.user.id;

    console.log('📝 Marking video as watched:', { enrollmentId, videoId, studentId });

    // Verify enrollment belongs to student
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .eq('student_id', studentId)
      .single();

    if (enrollmentError || !enrollment) {
      console.error('❌ Enrollment not found:', enrollmentError);
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if video exists
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      console.error('❌ Video not found:', videoError);
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if already marked as watched
    const { data: existingWatch } = await supabaseAdmin
      .from('video_watches')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('video_id', videoId)
      .single();

    if (existingWatch) {
      console.log('✅ Video already marked as watched');
      return res.status(200).json({
        success: true,
        message: 'Video already marked as watched',
        watched: true
      });
    }

    // Create watch record
    const { data: watchRecord, error: watchError } = await supabaseAdmin
      .from('video_watches')
      .insert({
        enrollment_id: enrollmentId,
        video_id: videoId,
        watched_at: new Date().toISOString()
      })
      .select()
      .single();

    if (watchError) {
      console.error('❌ Error creating watch record:', watchError);
      throw watchError;
    }

    console.log('✅ Video marked as watched:', watchRecord);

    // Update enrollment progress
    const { data: allVideos } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('course_id', enrollment.course_id);

    const { data: watchedVideos } = await supabaseAdmin
      .from('video_watches')
      .select('id')
      .eq('enrollment_id', enrollmentId);

    const progress = Math.round((watchedVideos?.length || 0) / (allVideos?.length || 1) * 100);

    await supabaseAdmin
      .from('enrollments')
      .update({ progress })
      .eq('id', enrollmentId);

    console.log('✅ Enrollment progress updated:', progress);

    res.status(200).json({
      success: true,
      message: 'Video marked as watched',
      watched: true,
      progress
    });
  } catch (error) {
    console.error('❌ Mark video as watched error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark video as watched',
      error: error.message
    });
  }
};

// Get watch status for all videos in an enrollment
export const getWatchStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const studentId = req.user.id;

    console.log('🔍 Fetching watch status:', { enrollmentId, studentId });

    // Verify enrollment belongs to student
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .eq('student_id', studentId)
      .single();

    if (enrollmentError || !enrollment) {
      console.error('❌ Enrollment not found:', enrollmentError);
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Get all watched videos for this enrollment
    const { data: watchedVideos, error: watchError } = await supabaseAdmin
      .from('video_watches')
      .select('video_id')
      .eq('enrollment_id', enrollmentId);

    if (watchError) {
      console.error('❌ Error fetching watch status:', watchError);
      throw watchError;
    }

    // Create watch status object
    const watchStatus = {};
    (watchedVideos || []).forEach(watch => {
      watchStatus[watch.video_id] = true;
    });

    console.log('✅ Watch status fetched:', watchStatus);

    res.status(200).json({
      success: true,
      message: 'Watch status fetched successfully',
      watchStatus,
      totalWatched: watchedVideos?.length || 0
    });
  } catch (error) {
    console.error('❌ Get watch status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watch status',
      error: error.message
    });
  }
};

// Get video details with course info
export const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    console.log('🎬 Fetching video details:', { videoId });

    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*, modules(id, title, course_id), courses(id, name, instructor_name)')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      console.error('❌ Video not found:', videoError);
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    console.log('✅ Video details fetched');

    res.status(200).json({
      success: true,
      message: 'Video details fetched successfully',
      video
    });
  } catch (error) {
    console.error('❌ Get video details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video details',
      error: error.message
    });
  }
};

// Get all videos for a course
export const getCourseVideos = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log('📹 Fetching course videos:', { courseId });

    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('modules')
      .select('id, title, videos(*)')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      throw modulesError;
    }

    console.log('✅ Course videos fetched:', modules?.length || 0, 'modules');

    res.status(200).json({
      success: true,
      message: 'Course videos fetched successfully',
      modules: modules || []
    });
  } catch (error) {
    console.error('❌ Get course videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course videos',
      error: error.message
    });
  }
};
