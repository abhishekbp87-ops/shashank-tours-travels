import express from 'express';
import { submitContact, getAllContactMessages, updateContactStatus } from '../controllers/contactController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public: Submit contact message (rate limited: max 8 per 2 min per IP)
router.post('/', rateLimiter({ windowMs: 120000, maxRequests: 8, message: 'Too many messages sent. Please wait a moment.' }), submitContact);

// Protected: Admin inquiry management
router.get('/', authenticateAdmin, getAllContactMessages);
router.patch('/:id', authenticateAdmin, updateContactStatus);

export default router;
