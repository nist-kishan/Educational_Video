import express from 'express';
import multer from 'multer';
import { authenticate, optionalAuthenticate, authorizeAdmin, authorizeTutor } from '../middleware/auth.js';
import * as studentController from '../controllers/studentController.js';
import * as videoWatchController from '../controllers/videoWatchController.js';
import * as reviewController from '../controllers/reviewController.js';
import * as assignmentSubmissionController from '../controllers/assignmentSubmissionController.js';
import * as certificateController from '../controllers/certificateController.js';
import * as bookmarkNotesController from '../controllers/bookmarkNotesController.js';
import * as communityController from '../controllers/communityController.js';
import * as analyticsController from '../controllers/analyticsController.js';
import * as adminController from '../controllers/adminController.js';
import { getUploadsDir } from '../utils/fileStorage.js';

const router = express.Router();

// Configure multer for assignment submissions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = getUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    cb(null, `submission-${timestamp}-${randomStr}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for assignment submissions
  }
});

// ==================== PUBLIC ROUTES (No auth required) ====================

// Get all published courses (no auth required)
router.get('/courses', studentController.getAllPublishedCourses);

// Get course details (public - no auth required, but optional for authenticated users)
router.get('/courses/:courseId', optionalAuthenticate, studentController.getCourseDetails);

// ==================== AUTHENTICATED ROUTES (Auth required) ====================

// Wishlist routes
router.post('/wishlist/:courseId', authenticate, studentController.addToWishlist);
router.delete('/wishlist/:courseId', authenticate, studentController.removeFromWishlist);
router.get('/wishlist', authenticate, studentController.getWishlist);

// Cart routes
router.post('/cart/:courseId', authenticate, studentController.addToCart);
router.delete('/cart/:courseId', authenticate, studentController.removeFromCart);
router.get('/cart', authenticate, studentController.getCart);

// Checkout and payment routes
router.post('/checkout', authenticate, studentController.checkout);
router.post('/payment/complete', authenticate, studentController.completePayment);

// Enrollments
router.get('/enrollments', authenticate, studentController.getEnrollments);
router.get('/my-enrollments', authenticate, studentController.getMyEnrollments);

// Transaction history
router.get('/transactions', authenticate, studentController.getTransactionHistory);

// ==================== VIDEO WATCH TRACKING ====================

// Mark video as watched
router.post('/enrollments/:enrollmentId/videos/:videoId/watch', authenticate, videoWatchController.markVideoAsWatched);

// Get watch status for enrollment
router.get('/enrollments/:enrollmentId/watch-status', authenticate, videoWatchController.getWatchStatus);

// Get video details
router.get('/videos/:videoId', authenticate, videoWatchController.getVideoDetails);

// Get all videos for a course
router.get('/courses/:courseId/videos', authenticate, videoWatchController.getCourseVideos);

// ==================== COURSE REVIEWS ====================

// Create review
router.post('/courses/:courseId/reviews', authenticate, reviewController.createReview);

// Get course reviews
router.get('/courses/:courseId/reviews', optionalAuthenticate, reviewController.getCourseReviews);

// Update review
router.put('/reviews/:reviewId', authenticate, reviewController.updateReview);

// Delete review
router.delete('/reviews/:reviewId', authenticate, reviewController.deleteReview);

// Get student's review
router.get('/courses/:courseId/reviews/student', authenticate, reviewController.getStudentReview);

// ==================== ASSIGNMENT SUBMISSIONS ====================

// Submit assignment (with optional file upload)
router.post('/assignments/:assignmentId/submit', authenticate, upload.single('file'), assignmentSubmissionController.submitAssignment);

// Get student submissions
router.get('/assignments/:assignmentId/submissions', authenticate, assignmentSubmissionController.getAssignmentSubmissions);

// Grade submission (Tutor only)
router.post('/submissions/:submissionId/grade', authenticate, authorizeTutor, assignmentSubmissionController.gradeSubmission);

// Get all submissions (Tutor only)
router.get('/assignments/:assignmentId/all-submissions', authenticate, authorizeTutor, assignmentSubmissionController.getAllSubmissions);

// ==================== CERTIFICATES ====================

// Complete course
router.post('/enrollments/:enrollmentId/complete', authenticate, certificateController.completeCourse);

// Get certificate
router.get('/certificates/:certificateId', authenticate, certificateController.getCertificate);

// Get all student certificates
router.get('/student/certificates', authenticate, certificateController.getStudentCertificates);

// Download certificate
router.get('/certificates/:certificateId/download', authenticate, certificateController.downloadCertificate);

// Verify certificate (Public)
router.get('/certificates/verify/:certificateNumber', certificateController.verifyCertificate);

// ==================== BOOKMARKS ====================

// Create bookmark
router.post('/videos/:videoId/bookmarks', authenticate, bookmarkNotesController.createBookmark);

// Get video bookmarks
router.get('/videos/:videoId/bookmarks', authenticate, bookmarkNotesController.getVideoBookmarks);

// Delete bookmark
router.delete('/bookmarks/:bookmarkId', authenticate, bookmarkNotesController.deleteBookmark);

// ==================== NOTES ====================

// Create note
router.post('/videos/:videoId/notes', authenticate, bookmarkNotesController.createNote);

// Get video notes
router.get('/videos/:videoId/notes', authenticate, bookmarkNotesController.getVideoNotes);

// Update note
router.put('/notes/:noteId', authenticate, bookmarkNotesController.updateNote);

// Delete note
router.delete('/notes/:noteId', authenticate, bookmarkNotesController.deleteNote);

// ==================== COMMENTS ====================

// Create comment
router.post('/videos/:videoId/comments', authenticate, communityController.createComment);

// Get video comments
router.get('/videos/:videoId/comments', optionalAuthenticate, communityController.getVideoComments);

// Like comment
router.post('/comments/:commentId/like', authenticate, communityController.likeComment);

// Delete comment
router.delete('/comments/:commentId', authenticate, communityController.deleteComment);

// ==================== DISCUSSION FORUM ====================

// Create thread
router.post('/courses/:courseId/forum/threads', authenticate, communityController.createThread);

// Get course threads
router.get('/courses/:courseId/forum/threads', authenticate, communityController.getCourseThreads);

// Reply to thread
router.post('/forum/threads/:threadId/replies', authenticate, communityController.replyToThread);

// Get thread replies
router.get('/forum/threads/:threadId/replies', authenticate, communityController.getThreadReplies);

// ==================== ANALYTICS ====================

// Get course analytics (Tutor)
router.get('/courses/:courseId/analytics', authenticate, authorizeTutor, analyticsController.getCourseAnalytics);

// Get tutor dashboard analytics
router.get('/tutor/dashboard/analytics', authenticate, authorizeTutor, analyticsController.getTutorDashboardAnalytics);

// Get platform analytics (Admin)
router.get('/admin/analytics', authenticate, authorizeAdmin, analyticsController.getPlatformAnalytics);

// Get revenue analytics (Admin)
router.get('/admin/analytics/revenue', authenticate, authorizeAdmin, analyticsController.getRevenueAnalytics);

// ==================== ADMIN MANAGEMENT ====================

// Get all users (Admin)
router.get('/admin/users', authenticate, authorizeAdmin, adminController.getAllUsers);

// Suspend user (Admin)
router.post('/admin/users/:userId/suspend', authenticate, authorizeAdmin, adminController.suspendUser);

// Activate user (Admin)
router.post('/admin/users/:userId/activate', authenticate, authorizeAdmin, adminController.activateUser);

// Delete user (Admin)
router.delete('/admin/users/:userId', authenticate, authorizeAdmin, adminController.deleteUser);

// Get flagged content (Admin)
router.get('/admin/flagged-content', authenticate, authorizeAdmin, adminController.getFlaggedContent);

// Approve flagged content (Admin)
router.post('/admin/flagged-content/:flagId/approve', authenticate, authorizeAdmin, adminController.approveFlaggedContent);

// Reject flagged content (Admin)
router.post('/admin/flagged-content/:flagId/reject', authenticate, authorizeAdmin, adminController.rejectFlaggedContent);

// Get all courses (Admin)
router.get('/admin/courses', authenticate, authorizeAdmin, adminController.getAllCourses);

// Approve course (Admin)
router.post('/admin/courses/:courseId/approve', authenticate, authorizeAdmin, adminController.approveCourse);

// Reject course (Admin)
router.post('/admin/courses/:courseId/reject', authenticate, authorizeAdmin, adminController.rejectCourse);

export default router;
