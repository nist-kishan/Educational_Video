import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as moderationController from '../controllers/moderationController.js';

const router = express.Router();

// Flag content
router.post('/flag', authenticate, moderationController.flagContent);

// Get flagged content (admin)
router.get('/flagged', authenticate, authorizeAdmin, moderationController.getFlaggedContent);

// Get single flagged content (admin)
router.get('/flagged/:id', authenticate, authorizeAdmin, moderationController.getFlaggedContentItem);

// Approve flagged content (admin)
router.post('/flagged/:id/approve', authenticate, authorizeAdmin, moderationController.approveFlaggedContent);

// Reject flagged content (admin)
router.post('/flagged/:id/reject', authenticate, authorizeAdmin, moderationController.rejectFlaggedContent);

// Get moderation history (admin)
router.get('/history', authenticate, authorizeAdmin, moderationController.getModerationHistory);

// Create moderation rule (admin)
router.post('/rules', authenticate, authorizeAdmin, moderationController.createModerationRule);

// Get moderation rules (admin)
router.get('/rules', authenticate, authorizeAdmin, moderationController.getModerationRules);

export default router;
