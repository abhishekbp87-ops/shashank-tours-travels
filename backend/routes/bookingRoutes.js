import express from 'express';
import { createBooking, getAllBookings, getBookingById, updateBooking } from '../controllers/bookingController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public: Submit booking request (rate limited: max 12 per 2 min per IP)
router.post('/', rateLimiter({ windowMs: 120000, maxRequests: 12, message: 'Too many booking requests. Please wait a moment or reach us via WhatsApp.' }), createBooking);

// Protected: Admin booking management
router.get('/', authenticateAdmin, getAllBookings);
router.get('/:id', authenticateAdmin, getBookingById);
router.patch('/:id', authenticateAdmin, updateBooking);

export default router;
