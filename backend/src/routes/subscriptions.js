import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as subscriptionController from '../controllers/subscriptionController.js';

const router = express.Router();

// Create subscription
router.post('/', authenticate, subscriptionController.createSubscription);

// Get user subscription
router.get('/user', authenticate, subscriptionController.getSubscription);

// Get all subscriptions (admin)
router.get('/', authenticate, authorizeAdmin, subscriptionController.getSubscriptions);

// Update subscription
router.put('/:id', authenticate, authorizeAdmin, subscriptionController.updateSubscription);

// Cancel subscription
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);

// Upgrade subscription
router.post('/upgrade', authenticate, subscriptionController.upgradeSubscription);

// Downgrade subscription
router.post('/downgrade', authenticate, subscriptionController.downgradeSubscription);

// Get subscription plans
router.get('/plans/list', subscriptionController.getPlans);

// Create plan (admin)
router.post('/plans', authenticate, authorizeAdmin, subscriptionController.createPlan);

// Update plan (admin)
router.put('/plans/:id', authenticate, authorizeAdmin, subscriptionController.updatePlan);

// Delete plan (admin)
router.delete('/plans/:id', authenticate, authorizeAdmin, subscriptionController.deletePlan);

export default router;
