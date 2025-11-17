import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as refundController from '../controllers/refundController.js';

const router = express.Router();

// Create refund request
router.post('/', authenticate, refundController.createRefundRequest);

// Get user refunds
router.get('/', authenticate, refundController.getRefunds);

// Get single refund
router.get('/:id', authenticate, refundController.getRefund);

// Update refund
router.put('/:id', authenticate, authorizeAdmin, refundController.updateRefund);

// Approve refund
router.post('/:id/approve', authenticate, authorizeAdmin, refundController.approveRefund);

// Reject refund
router.post('/:id/reject', authenticate, authorizeAdmin, refundController.rejectRefund);

// Process refund
router.post('/:id/process', authenticate, authorizeAdmin, refundController.processRefund);

// Get policies
router.get('/policies/get', refundController.getPolicies);

// Update policies (admin)
router.put('/policies/update', authenticate, authorizeAdmin, refundController.updatePolicies);

// Get all refunds (admin)
router.get('/admin/all', authenticate, authorizeAdmin, refundController.getAllRefunds);

export default router;
