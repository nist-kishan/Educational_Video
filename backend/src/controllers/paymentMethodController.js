import { supabaseAdmin } from '../config/supabase.js';

// Add payment method
export const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardNumber, cardholderName, expiryMonth, expiryYear, cvv, isDefault } = req.body;

    // Mask card number
    const maskedCard = `****${cardNumber.slice(-4)}`;

    const { data: paymentMethod, error } = await supabaseAdmin
      .from('payment_methods')
      .insert([{
        user_id: userId,
        card_number_masked: maskedCard,
        cardholder_name: cardholderName,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cvv: cvv, // In production, encrypt this
        is_default: isDefault || false,
        is_active: true,
        created_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, paymentMethod });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: methods, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, methods });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single payment method
export const getPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: method, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, method });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('payment_methods')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Remove default from all methods
    await supabaseAdmin
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set new default
    const { data: method, error } = await supabaseAdmin
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, method });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Validate payment method
export const validatePaymentMethod = async (req, res) => {
  try {
    const { cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    // Basic validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      return res.status(400).json({ success: false, message: 'Invalid expiry month' });
    }

    if (cvv.length < 3 || cvv.length > 4) {
      return res.status(400).json({ success: false, message: 'Invalid CVV' });
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(expiryYear, expiryMonth - 1);
    if (expiry < now) {
      return res.status(400).json({ success: false, message: 'Card expired' });
    }

    res.status(200).json({ success: true, message: 'Payment method valid' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
