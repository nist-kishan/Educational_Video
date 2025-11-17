import { supabaseAdmin } from '../config/supabase.js';

// Create subscription
export const createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, paymentMethodId } = req.body;

    // Get plan details
    const { data: plan } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Calculate renewal date
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    if (plan.billing_cycle === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else if (plan.billing_cycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        user_id: userId,
        plan_id: planId,
        payment_method_id: paymentMethodId,
        status: 'active',
        start_date: startDate,
        renewal_date: renewalDate,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user subscription
export const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all subscriptions (admin)
export const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: subscriptions, error, count } = await supabaseAdmin
      .from('subscriptions')
      .select('*, subscription_plans(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      subscriptions,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update subscription
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upgrade subscription
export const upgradeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPlanId } = req.body;

    // Get current subscription
    const { data: current } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!current) {
      return res.status(404).json({ success: false, message: 'No active subscription' });
    }

    // Update to new plan
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ plan_id: newPlanId, updated_at: new Date() })
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Downgrade subscription
export const downgradeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPlanId } = req.body;

    const { data: current } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!current) {
      return res.status(404).json({ success: false, message: 'No active subscription' });
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ plan_id: newPlanId, updated_at: new Date() })
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get subscription plans
export const getPlans = async (req, res) => {
  try {
    const { data: plans, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;

    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create plan (admin)
export const createPlan = async (req, res) => {
  try {
    const { name, description, price, billingCycle, features } = req.body;

    const { data: plan, error } = await supabaseAdmin
      .from('subscription_plans')
      .insert([{
        name,
        description,
        price,
        billing_cycle: billingCycle,
        features,
        is_active: true,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update plan (admin)
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: plan, error } = await supabaseAdmin
      .from('subscription_plans')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete plan (admin)
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('subscription_plans')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
