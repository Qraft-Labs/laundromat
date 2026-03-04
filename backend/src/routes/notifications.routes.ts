import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

router.get('/', notificationsController.getNotifications as any);
router.get('/unread-count', notificationsController.getUnreadCount as any);
router.patch('/:id/read', notificationsController.markAsRead as any);
router.patch('/read-all', notificationsController.markAllAsRead as any);
router.delete('/:id', notificationsController.deleteNotification as any);
router.post('/', notificationsController.createNotification as any);

export default router;
