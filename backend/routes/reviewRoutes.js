import express from 'express';
import {
  createReview,
  getApprovedReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview
} from '../controllers/reviewController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public: Get approved reviews to display on the live website
router.get('/', getApprovedReviews);

// Public: Submit a new customer review (rate limited: max 5 per 5 min per IP)
router.post('/', rateLimiter({ windowMs: 300000, maxRequests: 5, message: 'Review submission limit reached. Please try again later.' }), createReview);

// Protected: Admin moderation endpoints
router.get('/all', authenticateAdmin, getAllReviews);
router.patch('/:id', authenticateAdmin, updateReviewStatus);
router.delete('/:id', authenticateAdmin, deleteReview);

export default router;
