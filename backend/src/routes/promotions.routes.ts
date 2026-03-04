import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  activatePromotion,
  deletePromotion,
} from '../controllers/promotions.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate as any);

// Get all promotions
router.get('/', getAllPromotions as any);

// Get single promotion
router.get('/:id', getPromotionById as any);

// Create promotion
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Promotion name is required'),
    body('start_date').isISO8601().withMessage('Valid start date is required'),
    body('end_date').isISO8601().withMessage('Valid end date is required'),
    body('message').notEmpty().trim().withMessage('Message is required'),
    body('discount_percentage').optional().isInt({ min: 0, max: 100 }),
  ],
  createPromotion as any
);

// Update promotion
router.put(
  '/:id',
  [
    body('name').optional().trim(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('message').optional().trim(),
    body('discount_percentage').optional().isInt({ min: 0, max: 100 }),
    body('is_active').optional().isBoolean(),
  ],
  updatePromotion as any
);

// Activate promotion and send SMS
router.post('/:id/activate', activatePromotion as any);

// Delete promotion
router.delete('/:id', deletePromotion as any);

export default router;
