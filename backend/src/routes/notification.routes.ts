import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
} from '../controllers/notification.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate as any);

// Get user's notifications (with optional filters)
router.get('/', getUserNotifications as any);

// Get unread notification count
router.get('/unread-count', getUnreadCount as any);

// Mark single notification as read
router.patch('/:notificationId/read', markAsRead as any);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead as any);

// Delete single notification (own or admin)
router.delete('/:notificationId', deleteNotification as any);

// Delete all notifications (own or admin for others)
router.delete('/', deleteAllNotifications as any);

// Get notification statistics (admin only)
router.get('/stats/summary', requireAdmin as any, getNotificationStats as any);

export default router;
