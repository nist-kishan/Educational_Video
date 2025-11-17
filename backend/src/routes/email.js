import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as emailController from '../controllers/emailController.js';

const router = express.Router();

// Send email
router.post('/send', authenticate, emailController.sendEmail);

// Get templates
router.get('/templates', authenticate, authorizeAdmin, emailController.getTemplates);

// Create template
router.post('/templates', authenticate, authorizeAdmin, emailController.createTemplate);

// Update template
router.put('/templates/:id', authenticate, authorizeAdmin, emailController.updateTemplate);

// Delete template
router.delete('/templates/:id', authenticate, authorizeAdmin, emailController.deleteTemplate);

// Get settings
router.get('/settings', authenticate, authorizeAdmin, emailController.getSettings);

// Update settings
router.put('/settings', authenticate, authorizeAdmin, emailController.updateSettings);

export default router;
