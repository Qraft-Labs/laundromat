import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getFiscalYears,
  getCurrentFiscalYear,
  createFiscalYear,
  closeFiscalYear,
  reopenFiscalYear,
  getComparativeAnalysis,
  getYearEndSnapshots
} from '../controllers/fiscalYear.controller';

const router = express.Router();

// Get all fiscal years
router.get('/', authenticate as any, requireAdmin as any, getFiscalYears as any);

// Get current active fiscal year
router.get('/current', authenticate as any, requireAdmin as any, getCurrentFiscalYear as any);

// Get comparative analysis between two fiscal years
router.get('/compare', authenticate as any, requireAdmin as any, getComparativeAnalysis as any);

// Get year-end snapshots for a specific fiscal year
router.get('/:id/snapshots', authenticate as any, requireAdmin as any, getYearEndSnapshots as any);

// Create new fiscal year
router.post('/', authenticate as any, requireAdmin as any, createFiscalYear as any);

// Close a fiscal year (year-end closing)
router.post('/:id/close', authenticate as any, requireAdmin as any, closeFiscalYear as any);

// Reopen a closed fiscal year
router.post('/:id/reopen', authenticate as any, requireAdmin as any, reopenFiscalYear as any);

export default router;
