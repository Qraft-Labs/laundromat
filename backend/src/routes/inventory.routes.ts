import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requireAdminOrManager } from '../middleware/permissions';
import {
  getAllInventoryItems,
  addStock,
  recordUsage,
  getTransactions,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventory.controller';

const router = express.Router();

router.use(authenticate as any);
router.use(requireAdminOrManager as any); // Inventory routes require admin or manager

// Get all inventory items
router.get('/', getAllInventoryItems as any);

// Get transactions history
router.get('/transactions', getTransactions as any);

// Create new inventory item
router.post(
  '/',
  [
    body('item_name').trim().notEmpty().withMessage('Item name is required'),
    body('unit').trim().notEmpty().withMessage('Unit is required'),
    body('reorder_level').optional().isNumeric().withMessage('Reorder level must be a number'),
    body('unit_cost').optional().isNumeric().withMessage('Unit cost must be a number'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('category').optional().trim(),
    body('supplier').optional().trim(),
    body('notes').optional().trim(),
  ],
  createInventoryItem as any
);

// Update inventory item
router.put('/:id', updateInventoryItem as any);

// Delete inventory item
router.delete('/:id', deleteInventoryItem as any);

// Add stock (restock)
router.post(
  '/restock',
  [
    body('item_id').isInt({ min: 1 }),
    body('quantity').isFloat({ min: 0.01 }),
    body('unit_cost').optional().isFloat({ min: 0 }),
  ],
  addStock as any
);

// Record usage
router.post(
  '/usage',
  [
    body('item_id').isInt({ min: 1 }),
    body('quantity').isFloat({ min: 0.01 }),
    body('order_id').optional().isInt(),
  ],
  recordUsage as any
);

export default router;
