// src/routes/reviewRoutes.js
import { Router } from 'express';
import { createReview, findReviewById, findReviewByUser, deleteReviewById } from '../controllers/reviewController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'; // if you have one

const router = Router();

// If mounted at '/api/reviews', this handles POST /api/reviews
router.post('/', requireAuth, createReview); 
router.get('/:id', requireAuth, findReviewById)
router.get('/user/:userId', requireAuth, findReviewByUser)
router.delete('/delete/:id', requireAuth, requireAdmin, deleteReviewById)

export default router;