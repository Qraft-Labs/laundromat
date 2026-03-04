import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  sendAnnouncement,
  getAnnouncementHistory,
  scheduleFestivalAnnouncement,
} from '../controllers/announcement.controller';

const router = Router();

// All announcement routes require authentication and admin role
router.use(authenticate as any, requireAdmin as any);

/**
 * @route   POST /api/announcements/send
 * @desc    Send announcement/promotion to customers
 * @access  Admin only
 */
router.post(
  '/send',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('customerType')
      .isIn(['all', 'active', 'inactive'])
      .withMessage('Invalid customer type'),
    body('discountPercentage')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Discount must be between 0 and 100'),
  ],
  sendAnnouncement as any
);

/**
 * @route   GET /api/announcements/history
 * @desc    Get announcement history
 * @access  Admin only
 */
router.get('/history', getAnnouncementHistory as any);

/**
 * @route   POST /api/announcements/schedule
 * @desc    Schedule festival/holiday announcement
 * @access  Admin only
 */
router.post(
  '/schedule',
  [
    body('festivalName').trim().notEmpty().withMessage('Festival name is required'),
    body('scheduledDate').isISO8601().withMessage('Valid date required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('discountPercentage')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Discount must be between 0 and 100'),
  ],
  scheduleFestivalAnnouncement as any
);

export default router;
