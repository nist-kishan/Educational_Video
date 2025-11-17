import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as couponController from '../controllers/couponController.js';

const router = express.Router();

// Create coupon (admin)
router.post('/', authenticate, authorizeAdmin, couponController.createCoupon);

// Get coupons
router.get('/', couponController.getCoupons);

// Get single coupon
router.get('/:id', couponController.getCoupon);

// Update coupon (admin)
router.put('/:id', authenticate, authorizeAdmin, couponController.updateCoupon);

// Delete coupon (admin)
router.delete('/:id', authenticate, authorizeAdmin, couponController.deleteCoupon);

// Validate coupon
router.post('/validate', couponController.validateCoupon);

// Apply coupon
router.post('/:code/apply', authenticate, couponController.applyCoupon);

export default router;
