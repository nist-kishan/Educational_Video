import { supabaseAdmin } from '../config/supabase.js';

// Flag content
export const flagContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType, contentId, reason, description, severity } = req.body;

    const { data: flagged, error } = await supabaseAdmin
      .from('flagged_content')
      .insert([{
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        reason,
        description,
        severity: severity || 'medium',
        status: 'pending',
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, flagged });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get flagged content
export const getFlaggedContent = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('flagged_content')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: flagged, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      flagged,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single flagged content
export const getFlaggedContentItem = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: flagged, error } = await supabaseAdmin
      .from('flagged_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, flagged });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Approve flagged content
export const approveFlaggedContent = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: flagged, error } = await supabaseAdmin
      .from('flagged_content')
      .update({ status: 'approved', approved_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log moderation action
    await supabaseAdmin.from('moderation_history').insert([{
      flagged_content_id: id,
      action: 'approved',
      created_at: new Date()
    }]);

    res.status(200).json({ success: true, flagged });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reject flagged content
export const rejectFlaggedContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: flagged, error } = await supabaseAdmin
      .from('flagged_content')
      .update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log moderation action
    await supabaseAdmin.from('moderation_history').insert([{
      flagged_content_id: id,
      action: 'rejected',
      reason,
      created_at: new Date()
    }]);

    res.status(200).json({ success: true, flagged });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get moderation history
export const getModerationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: history, error, count } = await supabaseAdmin
      .from('moderation_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      history,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create moderation rule
export const createModerationRule = async (req, res) => {
  try {
    const { keyword, action, severity, description } = req.body;

    const { data: rule, error } = await supabaseAdmin
      .from('moderation_rules')
      .insert([{
        keyword,
        action,
        severity: severity || 'medium',
        description,
        is_active: true,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get moderation rules
export const getModerationRules = async (req, res) => {
  try {
    const { data: rules, error } = await supabaseAdmin
      .from('moderation_rules')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    res.status(200).json({ success: true, rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
