import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/permissions';
import {
  createBackup,
  getBackupStats,
  deleteOldData,
  getBackupHistory,
  saveEmailBackupSettings,
  getEmailBackupSettings,
  sendDailyBackupEmail,
  sendTestBackupEmail,
} from '../controllers/backup.controller';

const router = express.Router();

router.use(authenticate as any);
router.use(requireAdmin as any); // All backup routes require admin

// Get backup statistics
router.get('/stats', getBackupStats as any);

// Get backup history
router.get('/history', getBackupHistory as any);

// Get email backup settings
router.get('/email-settings', getEmailBackupSettings as any);

// Save email backup settings
router.post('/email-settings', saveEmailBackupSettings as any);

// Send daily backup email now (manual trigger)
router.post('/email/send-now', sendDailyBackupEmail as any);

// Send test backup email
router.post('/email/test', [
  body('email').isEmail().withMessage('Valid email address is required'),
], sendTestBackupEmail as any);

// Create and download backup
router.post(
  '/create',
  [
    body('tables').isString(),
  ],
  createBackup as any
);

// Delete old data
router.post(
  '/delete-old',
  [
    body('table').isIn(['orders', 'customers']),
    body('before_date').isISO8601(),
  ],
  deleteOldData as any
);

export default router;
