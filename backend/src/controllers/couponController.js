import { supabaseAdmin } from '../config/supabase.js';

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, maxUses, expiryDate, minPurchaseAmount, description } = req.body;

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .insert([{
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        max_uses: maxUses,
        expiry_date: expiryDate,
        min_purchase_amount: minPurchaseAmount,
        description,
        current_uses: 0,
        is_active: true,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get coupons
export const getCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: coupons, error, count } = await supabaseAdmin
      .from('coupons')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      coupons,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single coupon
export const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('coupons')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Validate coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Check expiry
    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon expired' });
    }

    // Check max uses
    if (coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Check minimum purchase
    if (purchaseAmount < coupon.min_purchase_amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum purchase amount is $${coupon.min_purchase_amount}` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (purchaseAmount * coupon.discount_value / 100).toFixed(2);
    } else {
      discount = coupon.discount_value;
    }

    res.status(200).json({ 
      success: true, 
      coupon,
      discount,
      finalAmount: (purchaseAmount - discount).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Apply coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;

    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Increment usage
    await supabaseAdmin
      .from('coupons')
      .update({ current_uses: coupon.current_uses + 1 })
      .eq('id', coupon.id);

    // Log usage
    await supabaseAdmin.from('coupon_usage').insert([{
      coupon_id: coupon.id,
      user_id: userId,
      created_at: new Date()
    }]);

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
