import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getFinancialDashboard,
  getFinancialReport,
  getProfitLossStatement,
} from '../controllers/financial.controller';

const router = Router();

// All financial routes require authentication and admin role
router.use(authenticate as any, requireAdmin as any);

/**
 * @route   GET /api/financial/dashboard
 * @desc    Get financial dashboard data
 * @access  Admin only
 */
router.get('/dashboard', getFinancialDashboard as any);

/**
 * @route   GET /api/financial/report
 * @desc    Get detailed financial report
 * @access  Admin only
 */
router.get('/report', getFinancialReport as any);

/**
 * @route   GET /api/financial/profit-loss
 * @desc    Get profit/loss statement
 * @access  Admin only
 */
router.get('/profit-loss', getProfitLossStatement as any);

export default router;