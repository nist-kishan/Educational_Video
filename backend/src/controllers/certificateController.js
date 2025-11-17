import { supabaseAdmin } from '../config/supabase.js';

// Mark course as complete
export const completeCourse = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const studentId = req.user.id;

    console.log('🏁 Completing course:', { enrollmentId, studentId });

    // Get enrollment
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*, courses(id, name, tutor_id)')
      .eq('id', enrollmentId)
      .eq('student_id', studentId)
      .single();

    if (enrollmentError || !enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if all videos watched
    const { data: allVideos } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('course_id', enrollment.course_id);

    const { data: watchedVideos } = await supabaseAdmin
      .from('video_watches')
      .select('id')
      .eq('enrollment_id', enrollmentId);

    const allWatched = allVideos?.length === watchedVideos?.length;

    if (!allWatched) {
      return res.status(400).json({
        success: false,
        message: 'You must watch all videos to complete the course'
      });
    }

    // Update enrollment
    const { data: updatedEnrollment, error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100
      })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Course completed');

    // Generate certificate
    const { data: certificate, error: certError } = await supabaseAdmin
      .from('certificates')
      .insert({
        enrollment_id: enrollmentId,
        student_id: studentId,
        course_id: enrollment.course_id,
        issued_at: new Date().toISOString(),
        certificate_number: `CERT-${Date.now()}-${studentId}`
      })
      .select()
      .single();

    if (certError) throw certError;

    console.log('✅ Certificate generated');

    res.status(200).json({
      success: true,
      message: 'Course completed and certificate generated',
      enrollment: updatedEnrollment,
      certificate
    });
  } catch (error) {
    console.error('❌ Complete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete course',
      error: error.message
    });
  }
};

// Get certificate
export const getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const studentId = req.user.id;

    console.log('📜 Fetching certificate:', { certificateId, studentId });

    const { data: certificate, error: certError } = await supabaseAdmin
      .from('certificates')
      .select('*, enrollments(*, courses(name, tutor_id)), users(first_name, last_name)')
      .eq('id', certificateId)
      .eq('student_id', studentId)
      .single();

    if (certError || !certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    console.log('✅ Certificate fetched');

    res.status(200).json({
      success: true,
      message: 'Certificate fetched successfully',
      certificate
    });
  } catch (error) {
    console.error('❌ Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: error.message
    });
  }
};

// Get all certificates for student
export const getStudentCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📜 Fetching student certificates:', { studentId });

    const { data: certificates, error: certError, count } = await supabaseAdmin
      .from('certificates')
      .select('*, courses(name)', { count: 'exact' })
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (certError) throw certError;

    console.log('✅ Certificates fetched:', certificates?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Certificates fetched successfully',
      certificates: certificates || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

// Download certificate (Generate PDF)
export const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const studentId = req.user.id;

    console.log('⬇️ Downloading certificate:', { certificateId, studentId });

    const { data: certificate, error: certError } = await supabaseAdmin
      .from('certificates')
      .select('*, enrollments(*, courses(name, tutor_id)), users(first_name, last_name)')
      .eq('id', certificateId)
      .eq('student_id', studentId)
      .single();

    if (certError || !certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Generate PDF (using a library like pdfkit)
    // For now, return certificate data
    console.log('✅ Certificate ready for download');

    res.status(200).json({
      success: true,
      message: 'Certificate ready for download',
      certificate,
      downloadUrl: `/api/certificates/${certificateId}/pdf`
    });
  } catch (error) {
    console.error('❌ Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
};

// Verify certificate
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    console.log('✔️ Verifying certificate:', { certificateNumber });

    const { data: certificate, error: certError } = await supabaseAdmin
      .from('certificates')
      .select('*, users(first_name, last_name), courses(name)')
      .eq('certificate_number', certificateNumber)
      .single();

    if (certError || !certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        verified: false
      });
    }

    console.log('✅ Certificate verified');

    res.status(200).json({
      success: true,
      message: 'Certificate verified',
      verified: true,
      certificate
    });
  } catch (error) {
    console.error('❌ Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      verified: false,
      error: error.message
    });
  }
};
