import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import {
  getAllDeliveries,
  getDeliveryByOrderId,
  createDelivery,
  assignDriver,
  updateDeliveryDetails,
  updateDeliveryPerson,
  updateDeliveryStatus,
  getDeliveryStats,
  getDeliveryZones,
  getDeliveryDrivers,
  getAvailableDrivers,
  recordDeliveryPayment,
} from '../controllers/deliveries.controller';

const router = express.Router();

router.use(authenticate as any);

// Get all deliveries
router.get('/', getAllDeliveries as any);

// Get delivery by order ID
router.get('/order/:orderId', getDeliveryByOrderId as any);

// Get delivery statistics
router.get('/stats', getDeliveryStats as any);

// Get delivery zones
router.get('/zones', getDeliveryZones as any);

// Get all drivers
router.get('/drivers', getDeliveryDrivers as any);

// Get available drivers for assignment
router.get('/drivers/available', getAvailableDrivers as any);

// Create/initiate delivery from order
router.post(
  '/',
  [
    body('order_id').isInt({ min: 1 }),
    body('delivery_type').isIn(['PAID', 'FREE']),
    body('delivery_revenue').optional().isNumeric(),
    body('scheduled_date').isDate(),
    body('scheduled_time_slot').optional().isString(),
    body('delivery_zone_id').optional().isInt({ min: 1 }),
    body('delivery_address').optional().isString(),
  ],
  createDelivery as any
);

// Assign driver to delivery
router.post(
  '/:id/assign',
  [
    body('driver_id').isInt({ min: 1 }),
  ],
  assignDriver as any
);

// Update delivery details (revenue, address, schedule) - only PENDING/ASSIGNED
router.put(
  '/:id/details',
  [
    body('delivery_revenue').optional().isNumeric(),
    body('delivery_type').optional().isIn(['PAID', 'FREE']),
    body('delivery_address').optional().isString(),
    body('delivery_notes').optional().isString(),
    body('scheduled_date').optional().isDate(),
    body('scheduled_time_slot').optional().isString(),
  ],
  updateDeliveryDetails as any
);

// Update delivery person/rider (manual entry)
router.put(
  '/:id/person',
  [
    body('delivery_person_name').optional().isString(),
    body('vehicle_info').optional().isString(),
  ],
  updateDeliveryPerson as any
);

// Update delivery status
router.put(
  '/:id/status',
  [
    body('status').isIn(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED']),
    body('failed_reason').optional().isString(),
    body('customer_rating').optional().isInt({ min: 1, max: 5 }),
    body('customer_feedback').optional().isString(),
  ],
  updateDeliveryStatus as any
);

// Record payment for delivery
router.put(
  '/:id/payment',
  [
    body('payment_amount').optional().isFloat({ min: 0 }),
    body('payment_method').optional().isIn(['CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER']),
    body('payment_status').optional().isIn(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED']),
    body('payment_notes').optional().isString(),
  ],
  recordDeliveryPayment as any
);

export default router;
