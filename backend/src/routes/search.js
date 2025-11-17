import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

// Advanced search
router.get('/', searchController.advancedSearch);

// Search courses
router.get('/courses', searchController.searchCourses);

// Search students (admin)
router.get('/students', authenticate, authorizeAdmin, searchController.searchStudents);

// Get search history
router.get('/history', authenticate, searchController.getSearchHistory);

// Clear search history
router.delete('/history/:id', authenticate, searchController.clearSearchHistory);

export default router;
