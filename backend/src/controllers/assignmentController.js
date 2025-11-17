import { supabaseAdmin } from '../config/supabase.js';

// Add assignment to module
export const addAssignment = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, instructions, dueDate, order } = req.body;
    const tutorId = req.user.id;

    // Validate required fields
    if (!title || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, instructions'
      });
    }

    // Check course ownership
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, tutor_id, total_assignments')
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
        message: 'Unauthorized: You can only add assignments to your own courses'
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
    let assignmentOrder = order;
    if (!assignmentOrder) {
      const { data: assignments } = await supabaseAdmin
        .from('assignments')
        .select('order_index')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: false })
        .limit(1);

      assignmentOrder = assignments && assignments.length > 0 ? assignments[0].order_index + 1 : 1;
    }

    // Create assignment
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .insert({
        course_id: courseId,
        module_id: moduleId,
        title,
        description: description || '',
        instructions,
        due_date: dueDate || null,
        order_index: assignmentOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('Assignment creation error:', assignmentError);
      return res.status(500).json({
        success: false,
        message: 'Failed to add assignment',
        error: assignmentError.message
      });
    }

    // Update course assignment count
    const newTotalAssignments = (course.total_assignments || 0) + 1;

    await supabaseAdmin
      .from('courses')
      .update({
        total_assignments: newTotalAssignments,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    res.status(201).json({
      success: true,
      message: 'Assignment added successfully',
      assignment,
      courseTotals: {
        total_assignments: newTotalAssignments
      }
    });
  } catch (error) {
    console.error('Add assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all assignments in a module
export const getModuleAssignments = async (req, res) => {
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
        message: 'Unauthorized: You can only view assignments from your own courses'
      });
    }

    const { data: assignments, error } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Fetch assignments error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignments fetched successfully',
      assignments: assignments || [],
      count: assignments?.length || 0
    });
  } catch (error) {
    console.error('Get course assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const { courseId, moduleId, assignmentId } = req.params;
    const { title, description, instructions, dueDate, order } = req.body;
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
        message: 'Unauthorized: You can only update assignments in your own courses'
      });
    }

    // Check assignment exists
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('module_id', moduleId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructions) updateData.instructions = instructions;
    if (dueDate !== undefined) updateData.due_date = dueDate;
    if (order !== undefined) updateData.order = order;
    updateData.updated_at = new Date().toISOString();

    // Update assignment
    const { data: updatedAssignment, error: updateError } = await supabaseAdmin
      .from('assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Assignment update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update assignment',
        error: updateError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { courseId, moduleId, assignmentId } = req.params;
    const tutorId = req.user.id;

    // Check course ownership
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('tutor_id, total_assignments')
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
        message: 'Unauthorized: You can only delete assignments from your own courses'
      });
    }

    // Check assignment exists
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('module_id', moduleId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Delete assignment
    const { error: deleteError } = await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      console.error('Assignment deletion error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete assignment',
        error: deleteError.message
      });
    }

    // Update course assignment count
    const newTotalAssignments = course.total_assignments - 1;

    await supabaseAdmin
      .from('courses')
      .update({
        total_assignments: newTotalAssignments,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
      courseTotals: {
        total_assignments: newTotalAssignments
      }
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
