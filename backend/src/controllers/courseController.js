import { supabaseAdmin } from '../config/supabase.js';

// Create a new course (Tutor only)
export const createCourse = async (req, res) => {
  try {
    const { name, description, price, category, playlist_name, modules, prerequisites, syllabus, motive } = req.body;
    const tutorId = req.user.id;

    console.log('📤 Creating course with data:', {
      name,
      description,
      price,
      category,
      playlist_name,
      modules_count: modules ? modules.length : 0,
      prerequisites,
      syllabus,
      motive,
      tutor_id: tutorId
    });

    // Validate required fields
    if (!name || !description || !price || !category || !playlist_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category, playlist_name'
      });
    }

    console.log('✅ All required fields present');

    // Create course
    const coursePayload = {
      name,
      description,
      price: parseFloat(price),
      tutor_id: tutorId,
      playlist_name,
      category,
      status: 'draft'
    };

    // Add optional fields if provided
    if (prerequisites && Array.isArray(prerequisites)) {
      coursePayload.prerequisites = prerequisites;
    }
    if (syllabus && Array.isArray(syllabus)) {
      coursePayload.syllabus = syllabus;
    }
    if (motive) {
      coursePayload.motive = motive;
    }

    console.log('📦 Course payload:', coursePayload);

    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert(coursePayload)
      .select()
      .single();

    if (courseError) {
      console.error('❌ Course creation error:', courseError);
      console.error('Error details:', JSON.stringify(courseError, null, 2));
      return res.status(500).json({
        success: false,
        message: 'Failed to create course',
        error: courseError.message,
        details: courseError
      });
    }

    console.log('✅ Course created successfully:', course.id);

    // Create modules if provided
    if (modules && Array.isArray(modules) && modules.length > 0) {
      for (const module of modules) {
        try {
          const { data: createdModule, error: moduleError } = await supabaseAdmin
            .from('modules')
            .insert({
              course_id: course.id,
              title: module.title,
              description: module.description || '',
              order_index: modules.indexOf(module) + 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (moduleError) {
            console.error('Module creation error:', moduleError);
            continue;
          }

          console.log('✅ Module created successfully:', {
            id: createdModule.id,
            title: createdModule.title,
            order_index: createdModule.order_index
          });

          // Create videos for this module
          if (module.videos && Array.isArray(module.videos)) {
            for (const video of module.videos) {
              try {
                const { data: video, error: videoError } = await supabaseAdmin
                  .from('videos')
                  .insert({
                    course_id: course.id,
                    module_id: createdModule.id,
                    title: video.title,
                    description: video.description || '',
                    duration: video.duration || 0,
                    is_demo: video.isDemo || false,
                    order_index: module.videos.indexOf(video) + 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (videoError) {
                  console.error('Video creation error:', videoError);
                } else {
                  console.log('✅ Video created successfully:', {
                    id: video.id,
                    title: video.title,
                    module_id: video.module_id,
                    order_index: video.order_index,
                    duration: video.duration
                  });
                }
              } catch (videoErr) {
                console.error('Video creation error:', videoErr);
              }
            }
          }

          // Create assignments for this module
          if (module.assignments && Array.isArray(module.assignments)) {
            for (const assignment of module.assignments) {
              try {
                const { data: assignment, error: assignmentError } = await supabaseAdmin
                  .from('assignments')
                  .insert({
                    course_id: course.id,
                    module_id: createdModule.id,
                    title: assignment.title,
                    description: assignment.description || '',
                    instructions: assignment.instructions || '',
                    // attachment_type: assignment.attachmentType || 'none', // Column doesn't exist yet
                    due_date: assignment.dueDate || null,
                    order_index: module.assignments.indexOf(assignment) + 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (assignmentError) {
                  console.error('Assignment creation error:', assignmentError);
                } else {
                  console.log('✅ Assignment created successfully:', {
                    id: assignment.id,
                    title: assignment.title,
                    module_id: assignment.module_id,
                    order_index: assignment.order_index,
                    due_date: assignment.due_date
                  });
                }
              } catch (assignmentErr) {
                console.error('Assignment creation error:', assignmentErr);
              }
            }
          }
        } catch (err) {
          console.error('Error processing module:', err);
        }
      }
    }

    console.log('🎉 Course creation completed! Summary:');
    console.log('📚 Course:', {
      id: course.id,
      name: course.name,
      tutor_id: course.tutor_id,
      status: course.status,
      modules_count: modules ? modules.length : 0
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('❌ Create course error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all courses by tutor
export const getTutorCourses = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch courses error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Courses fetched successfully',
      courses: courses || [],
      count: courses?.length || 0
    });
  } catch (error) {
    console.error('Get tutor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single course by ID (with authorization check)
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tutorId = req.user.id;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (course.tutor_id !== tutorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only access your own courses'
      });
    }

    // Fetch related videos and assignments
    const { data: videos } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    const { data: assignments } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    res.status(200).json({
      success: true,
      message: 'Course fetched successfully',
      course: {
        ...course,
        videos: videos || [],
        assignments: assignments || []
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update course (Tutor only - own courses)
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tutorId = req.user.id;
    const { name, description, price, prerequisites, syllabus, motive, category, status, playlist_name } = req.body;

    // Check authorization
    const { data: course, error: fetchError } = await supabaseAdmin
      .from('courses')
      .select('tutor_id')
      .eq('id', courseId)
      .single();

    if (fetchError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor_id !== tutorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own courses'
      });
    }

    // Update course
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (prerequisites) updateData.prerequisites = prerequisites;
    if (syllabus) updateData.syllabus = syllabus;
    if (motive) updateData.motive = motive;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (playlist_name) updateData.playlist_name = playlist_name;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedCourse, error: updateError } = await supabaseAdmin
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) {
      console.error('Course update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update course',
        error: updateError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete course (Tutor only - own courses)
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tutorId = req.user.id;

    console.log('🗑️ Delete course request:');
    console.log('- Course ID:', courseId);
    console.log('- Tutor ID:', tutorId);

    // Check authorization
    const { data: course, error: fetchError } = await supabaseAdmin
      .from('courses')
      .select('tutor_id')
      .eq('id', courseId)
      .single();

    console.log('- Course fetch result:', { course, error: fetchError });

    if (fetchError || !course) {
      console.log('❌ Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor_id !== tutorId) {
      console.log('❌ Unauthorized - course belongs to different tutor');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own courses'
      });
    }

    console.log('🗑️ Deleting related videos and assignments...');
    // Delete related videos and assignments first
    await supabaseAdmin
      .from('videos')
      .delete()
      .eq('course_id', courseId);

    await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('course_id', courseId);

    console.log('🗑️ Deleting course...');
    // Delete course
    const { error: deleteError } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (deleteError) {
      console.error('❌ Course deletion error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete course',
        error: deleteError.message
      });
    }

    console.log('✅ Course deleted successfully');
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Publish course (change status from draft to published)
export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tutorId = req.user.id;

    // Check authorization
    const { data: course, error: fetchError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (fetchError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutor_id !== tutorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only publish your own courses'
      });
    }

    // Check if course has at least one video
    const { data: videos, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('course_id', courseId)
      .limit(1);

    if (!videos || videos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course must have at least one video before publishing'
      });
    }

    // Update status
    const { data: updatedCourse, error: updateError } = await supabaseAdmin
      .from('courses')
      .update({
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (updateError) {
      console.error('Course publish error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to publish course',
        error: updateError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course published successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
