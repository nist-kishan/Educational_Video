import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// Create notification (admin)
router.post('/', authenticate, authorizeAdmin, notificationController.createNotification);

// Get user notifications
router.get('/', authenticate, notificationController.getNotifications);

// Get single notification
router.get('/:id', authenticate, notificationController.getNotification);

// Mark as read
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Get preferences
router.get('/preferences/get', authenticate, notificationController.getPreferences);

// Update preferences
router.put('/preferences/update', authenticate, notificationController.updatePreferences);

export default router;
