import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as recommendationController from '../controllers/recommendationController.js';

const router = express.Router();

// Get personalized recommendations
router.get('/', authenticate, recommendationController.getRecommendations);

// Get trending courses
router.get('/trending', recommendationController.getTrendingCourses);

// Get similar courses
router.get('/similar/:courseId', recommendationController.getSimilarCourses);

// Get recommended for you
router.get('/for-you', authenticate, recommendationController.getRecommendedForYou);

export default router;
