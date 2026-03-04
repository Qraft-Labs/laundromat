import { Router } from 'express';
import { 
  sendOrderReminder, 
  getReminderSettings, 
  updateReminderSettings,
  getOrdersNeedingReminders
} from '../controllers/reminder.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Send manual reminder for specific order
router.post(
  '/orders/:id/remind',
  authenticate as any,
  sendOrderReminder as any
);

// Get reminder automation settings
router.get(
  '/settings',
  authenticate as any,
  authorize(UserRole.ADMIN, UserRole.MANAGER) as any,
  getReminderSettings as any
);

// Update reminder automation settings
router.put(
  '/settings',
  authenticate as any,
  authorize(UserRole.ADMIN, UserRole.MANAGER) as any,
  updateReminderSettings as any
);

// Get orders needing automated reminders (for cron job)
router.get(
  '/pending',
  authenticate as any,
  authorize(UserRole.ADMIN) as any,
  getOrdersNeedingReminders as any
);

export default router;
