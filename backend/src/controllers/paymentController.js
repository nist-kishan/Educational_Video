import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

// ==================== RAZORPAY PAYMENT ====================

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;
    const studentId = req.user.id;

    console.log('🔄 Creating Razorpay order:', { orderId, amount, studentId });

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', studentId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // For demo: Create a mock Razorpay order
    // In production, use: const razorpayOrder = await razorpayInstance.orders.create({...})
    const razorpayOrder = {
      id: `order_${Date.now()}`,
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `order_${orderId}`,
      status: 'created',
      created_at: new Date().toISOString()
    };

    console.log('✅ Razorpay order created:', razorpayOrder);

    res.status(200).json({
      success: true,
      message: 'Razorpay order created',
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const studentId = req.user.id;

    console.log('🔍 Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id });

    // Verify signature (in production)
    if (process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error('❌ Signature verification failed');
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }
    }

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', studentId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        student_id: studentId,
        payment_method: 'razorpay',
        transaction_id: razorpay_payment_id,
        amount: order.total_amount,
        currency: 'INR',
        status: 'completed',
        payment_data: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Payment record creation error:', paymentError);
      throw paymentError;
    }

    console.log('✅ Payment record created:', payment);

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Order update error:', updateError);
      throw updateError;
    }

    // Get order items and create enrollments
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('item_id')
      .eq('order_id', orderId)
      .eq('item_type', 'course');

    if (itemsError) {
      console.error('❌ Order items fetch error:', itemsError);
      throw itemsError;
    }

    console.log('📦 Order items:', orderItems);

    const enrollments = (orderItems || []).map(item => ({
      student_id: studentId,
      course_id: item.item_id,
      status: 'active',
      progress: 0,
      enrolled_at: new Date().toISOString()
    }));

    if (enrollments.length > 0) {
      const { error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .insert(enrollments);

      if (enrollError) {
        console.error('❌ Enrollment creation error:', enrollError);
        throw enrollError;
      }

      console.log('✅ Enrollments created:', enrollments);
    }

    // Clear cart
    const { error: cartError } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('student_id', studentId);

    if (cartError) {
      console.error('⚠️ Cart clear error (non-critical):', cartError);
    }

    console.log('✅ Payment verification completed successfully');

    res.status(200).json({
      success: true,
      message: 'Payment verified and enrollment completed',
      payment,
      orderId
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// ==================== STRIPE PAYMENT ====================

// Create Stripe payment intent
export const createStripePaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, currency = 'usd' } = req.body;
    const studentId = req.user.id;

    console.log('🔄 Creating Stripe payment intent:', { orderId, amount, currency });

    // Verify order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', studentId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // For demo: Create mock payment intent
    // In production, use: const paymentIntent = await stripe.paymentIntents.create({...})
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      status: 'requires_payment_method',
      created: Math.floor(Date.now() / 1000)
    };

    console.log('✅ Stripe payment intent created:', paymentIntent);

    res.status(200).json({
      success: true,
      message: 'Payment intent created',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('❌ Stripe payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Confirm Stripe payment
export const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const studentId = req.user.id;

    console.log('🔍 Confirming Stripe payment:', { paymentIntentId, orderId });

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', studentId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: orderId,
        student_id: studentId,
        payment_method: 'stripe',
        transaction_id: paymentIntentId,
        amount: order.total_amount,
        currency: 'usd',
        status: 'completed',
        payment_data: {
          payment_intent_id: paymentIntentId,
          status: 'succeeded'
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Payment record creation error:', paymentError);
      throw paymentError;
    }

    console.log('✅ Payment record created:', payment);

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Order update error:', updateError);
      throw updateError;
    }

    // Get order items and create enrollments
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('item_id')
      .eq('order_id', orderId)
      .eq('item_type', 'course');

    if (itemsError) {
      console.error('❌ Order items fetch error:', itemsError);
      throw itemsError;
    }

    const enrollments = (orderItems || []).map(item => ({
      student_id: studentId,
      course_id: item.item_id,
      status: 'active',
      progress: 0,
      enrolled_at: new Date().toISOString()
    }));

    if (enrollments.length > 0) {
      const { error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .insert(enrollments);

      if (enrollError) {
        console.error('❌ Enrollment creation error:', enrollError);
        throw enrollError;
      }

      console.log('✅ Enrollments created:', enrollments);
    }

    // Clear cart
    const { error: cartError } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('student_id', studentId);

    if (cartError) {
      console.error('⚠️ Cart clear error (non-critical):', cartError);
    }

    console.log('✅ Payment confirmation completed successfully');

    res.status(200).json({
      success: true,
      message: 'Payment confirmed and enrollment completed',
      payment,
      orderId
    });
  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment confirmation failed',
      error: error.message
    });
  }
};

// ==================== PAYMENT HISTORY ====================

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📊 Fetching payment history:', { studentId, page, limit });

    const { data: payments, error, count } = await supabaseAdmin
      .from('payments')
      .select('*, orders(id, total_amount, status)', { count: 'exact' })
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Payment history fetch error:', error);
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Payment history fetched successfully',
      payments: payments || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const studentId = req.user.id;

    console.log('📋 Fetching payment details:', { paymentId, studentId });

    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*, orders(*, order_items(*))')
      .eq('id', paymentId)
      .eq('student_id', studentId)
      .single();

    if (error || !payment) {
      console.error('❌ Payment not found:', error);
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment details fetched successfully',
      payment
    });
  } catch (error) {
    console.error('❌ Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};
