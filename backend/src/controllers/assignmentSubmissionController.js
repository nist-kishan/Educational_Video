import { supabaseAdmin } from '../config/supabase.js';

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submissionText } = req.body;
    const studentId = req.user.id;
    let fileUrl = '';

    console.log('📝 Submitting assignment:', { assignmentId, studentId });
    console.log('📁 File received:', req.file ? req.file.filename : 'No file');

    // Check if assignment exists
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('*, modules(course_id)')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if student is enrolled
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', assignment.modules.course_id)
      .eq('student_id', studentId)
      .single();

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course'
      });
    }

    // Check if already submitted
    const { data: existingSubmission } = await supabaseAdmin
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .single();

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }

    // Handle file if uploaded
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      console.log('📁 File saved:', fileUrl);
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        submission_text: submissionText || '',
        file_url: fileUrl,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    console.log('✅ Assignment submitted:', submission);

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    console.error('❌ Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

// Get student submissions for assignment
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    console.log('📖 Fetching submissions:', { assignmentId, studentId });

    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('assignment_submissions')
      .select('*, assignments(id, title, description, instructions, due_date)')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (submissionsError) throw submissionsError;

    console.log('✅ Submissions fetched:', submissions?.length || 0);
    console.log('📋 Submission details:', submissions);

    res.status(200).json({
      success: true,
      message: 'Submissions fetched successfully',
      submissions: submissions || [],
      assignment: submissions?.[0]?.assignments || null
    });
  } catch (error) {
    console.error('❌ Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Grade assignment submission (Tutor only)
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const tutorId = req.user.id;

    console.log('📊 Grading submission:', { submissionId, grade, tutorId });

    // Get submission
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('assignment_submissions')
      .select('*, assignments(modules(course_id))')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify tutor owns the course
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', submission.assignments.modules.course_id)
      .eq('tutor_id', tutorId)
      .single();

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You can only grade submissions for your courses'
      });
    }

    // Update submission
    const { data: gradedSubmission, error: gradeError } = await supabaseAdmin
      .from('assignment_submissions')
      .update({
        grade: grade || null,
        feedback: feedback || '',
        graded_at: new Date().toISOString(),
        status: 'graded'
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (gradeError) throw gradeError;

    console.log('✅ Submission graded');

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission: gradedSubmission
    });
  } catch (error) {
    console.error('❌ Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message
    });
  }
};

// Get all submissions for assignment (Tutor only)
export const getAllSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const tutorId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📋 Fetching all submissions:', { assignmentId, tutorId });

    // Verify tutor owns the assignment
    const { data: assignment } = await supabaseAdmin
      .from('assignments')
      .select('*, modules(course_id)')
      .eq('id', assignmentId)
      .single();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', assignment.modules.course_id)
      .eq('tutor_id', tutorId)
      .single();

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You can only view submissions for your courses'
      });
    }

    // Get submissions
    const { data: submissions, error: submissionsError, count } = await supabaseAdmin
      .from('assignment_submissions')
      .select('*, users(id, first_name, last_name)', { count: 'exact' })
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (submissionsError) throw submissionsError;

    console.log('✅ All submissions fetched:', submissions?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Submissions fetched successfully',
      submissions: submissions || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};
