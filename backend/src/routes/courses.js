import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, authorizeTutor } from '../middleware/auth.js';
import { validateCourse, validateVideo, validateAssignment } from '../middleware/validation.js';
import * as courseController from '../controllers/courseController.js';
import * as moduleController from '../controllers/moduleController.js';
import * as videoController from '../controllers/videoController.js';
import * as assignmentController from '../controllers/assignmentController.js';
import { uploadVideoToCloudinary, getDemoVideo } from '../utils/cloudinary.js';
import { getUploadsDir } from '../utils/fileStorage.js';
import { supabaseAdmin } from '../config/supabase.js';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = getUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}_${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB - Support for large video files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Test Cloudinary configuration (requires auth + tutor role)
router.get('/test-cloudinary', authenticate, authorizeTutor, async (req, res) => {
  try {
    console.log('🧪 Testing Cloudinary configuration...');
    
    // Test credentials by calling the ping API
    const result = await cloudinary.api.ping();
    
    console.log('✅ Cloudinary ping successful:', result);
    
    res.status(200).json({
      success: true,
      message: 'Cloudinary configuration is working',
      result
    });
  } catch (error) {
    console.error('❌ Cloudinary configuration test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary configuration error',
      error: error.message
    });
  }
});

// ==================== COURSE ROUTES ====================

// Create a new course (requires auth + tutor role)
router.post('/', authenticate, authorizeTutor, validateCourse, courseController.createCourse);

// Get all courses by tutor (requires auth + tutor role)
router.get('/', authenticate, authorizeTutor, courseController.getTutorCourses);

// Get single course by ID (requires auth + tutor role)
router.get('/:courseId', authenticate, authorizeTutor, courseController.getCourseById);

// Update course (requires auth + tutor role)
router.put('/:courseId', authenticate, authorizeTutor, validateCourse, courseController.updateCourse);

// Delete course (requires auth + tutor role)
router.delete('/:courseId', authenticate, authorizeTutor, courseController.deleteCourse);

// Publish course (requires auth + tutor role)
router.patch('/:courseId/publish', authenticate, authorizeTutor, courseController.publishCourse);

// ==================== MODULE ROUTES ====================

// Create module (requires auth + tutor role)
router.post('/:courseId/modules', authenticate, authorizeTutor, moduleController.createModule);

// Get all modules in course (requires auth + tutor role)
router.get('/:courseId/modules', authenticate, authorizeTutor, moduleController.getCourseModules);

// Get single module (requires auth + tutor role)
router.get('/:courseId/modules/:moduleId', authenticate, authorizeTutor, moduleController.getModuleById);

// Update module (requires auth + tutor role)
router.put('/:courseId/modules/:moduleId', authenticate, authorizeTutor, moduleController.updateModule);

// Delete module (requires auth + tutor role)
router.delete('/:courseId/modules/:moduleId', authenticate, authorizeTutor, moduleController.deleteModule);

// ==================== VIDEO ROUTES ====================

// Add video to module (requires auth + tutor role)
router.post('/:courseId/modules/:moduleId/videos', authenticate, authorizeTutor, validateVideo, videoController.addVideo);

// Upload video to Cloudinary (requires auth + tutor role)
router.post('/:courseId/modules/:moduleId/videos/upload', authenticate, authorizeTutor, upload.single('file'), async (req, res) => {
  let localFilePath = null;

  try {
    const { courseId, moduleId } = req.params;
    const { title, description, isDemo } = req.body;

    console.log('📤 Video upload request details:');
    console.log('- Request params:', { courseId, moduleId });
    console.log('- Request body:', { title, description, isDemo });
    console.log('- Request file details:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file');

    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    if (!title) {
      console.log('❌ No title provided in request');
      return res.status(400).json({
        success: false,
        message: 'Video title is required'
      });
    }

    // Store local file path for cleanup
    localFilePath = req.file.path;
    console.log('💾 File saved locally at:', localFilePath);

    // Step 1: Get course for playlist name
    console.log('🔍 Step 1: Fetching course details for playlist name...');
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('playlist_name')
      .eq('id', courseId)
      .single();

    console.log('- Course data:', course);

    if (!course) {
      console.log('❌ Course not found');
      // Delete local file on error
      if (localFilePath) {
        const fs = await import('fs');
        fs.unlinkSync(localFilePath);
        console.log('🗑️ Local file deleted due to course not found');
      }
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Step 2: Upload to Cloudinary FIRST
    console.log('☁️ Step 2: Uploading to Cloudinary...');
    console.log('- Using playlist_name:', course.playlist_name);
    console.log('- Video title:', title);
    console.log('- Is demo:', isDemo === 'true' || isDemo === true);
    
    const uploadResult = await uploadVideoToCloudinary(
      localFilePath,
      course.playlist_name,
      title,
      isDemo === 'true' || isDemo === true
    );

    console.log('☁️ Cloudinary upload result:', uploadResult);

    if (!uploadResult.success) {
      console.log('❌ Cloudinary upload failed:', uploadResult.error);
      console.log('⚠️ Local file kept for retry:', localFilePath);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload video to Cloudinary',
        error: uploadResult.error,
        localFilePath: localFilePath
      });
    }

    console.log('✅ Cloudinary upload successful!');
    console.log('- Cloudinary URL:', uploadResult.url);
    console.log('- Cloudinary Public ID:', uploadResult.public_id);

    // Step 3: Delete local file BEFORE saving to database
    console.log('🗑️ Step 3: Deleting local file...');
    const fs = await import('fs');
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log('✅ Local file deleted successfully');
    }

    // Step 4: Save video record to database
    console.log('💾 Step 4: Saving video record to database...');
    const videoDuration = Math.round(uploadResult.duration || 0);
    console.log('- Duration from Cloudinary:', uploadResult.duration);
    console.log('- Duration converted to integer:', videoDuration);
    
    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .insert({
        course_id: courseId,
        module_id: moduleId,
        title,
        description: description || '',
        video_url: uploadResult.url,
        url: uploadResult.url,
        thumbnail_url: uploadResult.thumbnail_url || null,
        duration: videoDuration,
        is_demo: isDemo === 'true' || isDemo === true,
        is_preview: false,
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    console.log('- Database save result:', { video, error });

    if (error) {
      console.log('❌ Database save failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save video to database',
        error: error.message
      });
    }

    console.log('✅ Video record saved to database successfully');
    console.log('- Video ID:', video.id);

    // Step 5: Update course video count
    console.log('📊 Step 5: Updating course video count...');
    const { data: courseData } = await supabaseAdmin
      .from('courses')
      .select('total_videos, total_duration')
      .eq('id', courseId)
      .single();

    const newTotalVideos = (courseData?.total_videos || 0) + 1;
    const newTotalDuration = (courseData?.total_duration || 0) + videoDuration;

    await supabaseAdmin
      .from('courses')
      .update({
        total_videos: newTotalVideos,
        total_duration: newTotalDuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    console.log('✅ Course video count updated');
    console.log('- New total videos:', newTotalVideos);
    console.log('- New total duration:', newTotalDuration);

    // Step 6: Return success response
    console.log('✅ Video upload workflow completed successfully');
    console.log('- Final response data:', video);

    const response = {
      success: true,
      message: 'Video uploaded successfully',
      video
    };
    
    console.log('📤 Sending response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Video upload error:', error);
    console.error('❌ Error stack:', error.stack);
    console.log('⚠️ Local file kept for retry:', localFilePath);
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message,
      localFilePath: localFilePath
    });
  }
});

// Get all videos in module (requires auth + tutor role)
router.get('/:courseId/modules/:moduleId/videos', authenticate, authorizeTutor, videoController.getModuleVideos);

// Update video (requires auth + tutor role)
router.put('/:courseId/modules/:moduleId/videos/:videoId', authenticate, authorizeTutor, validateVideo, videoController.updateVideo);

// Delete video (requires auth + tutor role)
router.delete('/:courseId/modules/:moduleId/videos/:videoId', authenticate, authorizeTutor, videoController.deleteVideo);

// ==================== DEMO VIDEO ROUTES ====================

// Get demo video (public - no auth required)
router.get('/:courseId/demo/public', async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get course for playlist name
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('playlist_name')
      .eq('id', courseId)
      .single();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get demo video from Cloudinary
    const demoResult = await getDemoVideo(course.playlist_name);

    if (!demoResult.success) {
      return res.status(404).json({
        success: false,
        message: 'No demo video available for this course'
      });
    }

    res.status(200).json({
      success: true,
      demo: demoResult.demo
    });
  } catch (error) {
    console.error('Get demo video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ==================== ASSIGNMENT ROUTES ====================

// Add assignment to module (requires auth + tutor role)
router.post('/:courseId/modules/:moduleId/assignments', authenticate, authorizeTutor, validateAssignment, assignmentController.addAssignment);

// Get all assignments in module (requires auth + tutor role)
router.get('/:courseId/modules/:moduleId/assignments', authenticate, authorizeTutor, assignmentController.getModuleAssignments);

// Update assignment (requires auth + tutor role)
router.put('/:courseId/modules/:moduleId/assignments/:assignmentId', authenticate, authorizeTutor, validateAssignment, assignmentController.updateAssignment);

// Delete assignment (requires auth + tutor role)
router.delete('/:courseId/modules/:moduleId/assignments/:assignmentId', authenticate, authorizeTutor, assignmentController.deleteAssignment);

export default router;
