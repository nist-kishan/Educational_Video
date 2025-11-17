import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as paymentMethodController from '../controllers/paymentMethodController.js';

const router = express.Router();

// Add payment method
router.post('/', authenticate, paymentMethodController.addPaymentMethod);

// Get payment methods
router.get('/', authenticate, paymentMethodController.getPaymentMethods);

// Get single payment method
router.get('/:id', authenticate, paymentMethodController.getPaymentMethod);

// Delete payment method
router.delete('/:id', authenticate, paymentMethodController.deletePaymentMethod);

// Set default payment method
router.patch('/:id/default', authenticate, paymentMethodController.setDefaultPaymentMethod);

// Validate payment method
router.post('/validate', paymentMethodController.validatePaymentMethod);

export default router;
