import { supabaseAdmin } from '../config/supabase.js';

// Create refund request
export const createRefundRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enrollmentId, reason, description, refundType } = req.body;

    // Get enrollment details
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Calculate refund amount
    const daysEnrolled = Math.floor((Date.now() - new Date(enrollment.created_at)) / (1000 * 60 * 60 * 24));
    const refundPercentage = Math.max(0, 100 - (daysEnrolled * 5));
    const refundAmount = (enrollment.amount * refundPercentage / 100).toFixed(2);

    const { data: refund, error } = await supabaseAdmin
      .from('refunds')
      .insert([{
        enrollment_id: enrollmentId,
        user_id: userId,
        reason,
        description,
        refund_type: refundType,
        amount: refundAmount,
        status: 'pending',
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get refund requests
export const getRefunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: refunds, error, count } = await supabaseAdmin
      .from('refunds')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      refunds,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single refund
export const getRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: refund, error } = await supabaseAdmin
      .from('refunds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update refund status
export const updateRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: refund, error } = await supabaseAdmin
      .from('refunds')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Approve refund
export const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: refund, error } = await supabaseAdmin
      .from('refunds')
      .update({ status: 'approved', approved_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reject refund
export const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: refund, error } = await supabaseAdmin
      .from('refunds')
      .update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: refund, error } = await supabaseAdmin
      .from('refunds')
      .update({ status: 'processed', processed_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get refund policies
export const getPolicies = async (req, res) => {
  try {
    const { data: policies, error } = await supabaseAdmin
      .from('refund_policies')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({
      success: true,
      policies: policies || {
        refund_window_days: 30,
        refund_percentage_per_day: 5,
        min_refund_amount: 0,
        allow_partial_refunds: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update refund policies
export const updatePolicies = async (req, res) => {
  try {
    const policies = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('refund_policies')
      .upsert({ ...policies, updated_at: new Date() })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, policies: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all refunds (admin)
export const getAllRefunds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('refunds')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: refunds, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      refunds,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
