import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripePaymentIntent,
  confirmStripePayment,
  getPaymentHistory,
  getPaymentDetails
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ==================== RAZORPAY ROUTES ====================

// Create Razorpay order
router.post('/razorpay/create-order', authenticate, createRazorpayOrder);

// Verify Razorpay payment
router.post('/razorpay/verify', authenticate, verifyRazorpayPayment);

// ==================== STRIPE ROUTES ====================

// Create Stripe payment intent
router.post('/stripe/create-intent', authenticate, createStripePaymentIntent);

// Confirm Stripe payment
router.post('/stripe/confirm', authenticate, confirmStripePayment);

// ==================== PAYMENT HISTORY ====================

// Get payment history
router.get('/history', authenticate, getPaymentHistory);

// Get payment details
router.get('/:paymentId', authenticate, getPaymentDetails);

export default router;
