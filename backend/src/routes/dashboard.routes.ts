import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Basic dashboard stats
router.get('/stats', dashboardController.getDashboardStats as any);

// Recent orders (orders worked on today)
router.get('/recent-orders', dashboardController.getRecentOrders as any);

// Enhanced financial endpoints
router.get('/financial-summary', dashboardController.getFinancialSummary as any);
router.get('/payment-methods-breakdown', dashboardController.getPaymentMethodsBreakdown as any);
router.get('/outstanding-balances', dashboardController.getOutstandingBalances as any);
router.get('/daily-collections', dashboardController.getDailyCollections as any);
router.get('/month-over-month', dashboardController.getMonthOverMonth as any);

export default router;
