import { supabaseAdmin } from '../config/supabase.js';

// Create a new module in a course
export const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;
    const tutorId = req.user.id;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Module title is required'
      });
    }

    // Check course ownership
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, tutor_id')
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
        message: 'Unauthorized: You can only add modules to your own courses'
      });
    }

    // Get next order if not provided
    let moduleOrder = order;
    if (!moduleOrder) {
      const { data: modules } = await supabaseAdmin
        .from('modules')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1);

      moduleOrder = modules && modules.length > 0 ? modules[0].order_index + 1 : 1;
    }

    // Create module
    const { data: module, error: moduleError } = await supabaseAdmin
      .from('modules')
      .insert({
        course_id: courseId,
        title,
        description: description || '',
        order_index: moduleOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (moduleError) {
      console.error('Module creation error:', moduleError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create module',
        error: moduleError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all modules in a course
export const getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params;
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
        message: 'Unauthorized: You can only view modules from your own courses'
      });
    }

    const { data: modules, error } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Fetch modules error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch modules',
        error: error.message
      });
    }

    // Fetch videos and assignments for each module
    const modulesWithContent = await Promise.all(
      (modules || []).map(async (module) => {
        const { data: videos } = await supabaseAdmin
          .from('videos')
          .select('*')
          .eq('module_id', module.id)
          .order('order_index', { ascending: true });

        const { data: assignments } = await supabaseAdmin
          .from('assignments')
          .select('*')
          .eq('module_id', module.id)
          .order('order_index', { ascending: true });

        return {
          ...module,
          videos: videos || [],
          assignments: assignments || []
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Modules fetched successfully',
      modules: modulesWithContent,
      count: modulesWithContent.length
    });
  } catch (error) {
    console.error('Get course modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single module with videos and assignments
export const getModuleById = async (req, res) => {
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
        message: 'Unauthorized'
      });
    }

    // Get module
    const { data: module, error: moduleError } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .eq('course_id', courseId)
      .single();

    if (moduleError || !module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get videos and assignments
    const { data: videos } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    const { data: assignments } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    res.status(200).json({
      success: true,
      message: 'Module fetched successfully',
      module: {
        ...module,
        videos: videos || [],
        assignments: assignments || []
      }
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update module
export const updateModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, order } = req.body;
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
        message: 'Unauthorized'
      });
    }

    // Check module exists
    const { data: module, error: moduleError } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .eq('course_id', courseId)
      .single();

    if (moduleError || !module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    updateData.updated_at = new Date().toISOString();

    // Update module
    const { data: updatedModule, error: updateError } = await supabaseAdmin
      .from('modules')
      .update(updateData)
      .eq('id', moduleId)
      .select()
      .single();

    if (updateError) {
      console.error('Module update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update module',
        error: updateError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      module: updatedModule
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete module
export const deleteModule = async (req, res) => {
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
        message: 'Unauthorized'
      });
    }

    // Check module exists
    const { data: module, error: moduleError } = await supabaseAdmin
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .eq('course_id', courseId)
      .single();

    if (moduleError || !module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Delete related videos and assignments
    await supabaseAdmin
      .from('videos')
      .delete()
      .eq('module_id', moduleId);

    await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('module_id', moduleId);

    // Delete module
    const { error: deleteError } = await supabaseAdmin
      .from('modules')
      .delete()
      .eq('id', moduleId);

    if (deleteError) {
      console.error('Module deletion error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete module',
        error: deleteError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
