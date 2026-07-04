// src/routes/reviewRoutes.js
import { Router } from 'express';
import { createReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js'; // if you have one

const router = Router();

// If mounted at '/api/reviews', this handles POST /api/reviews
router.post('/', requireAuth, createReview); 

export default router;