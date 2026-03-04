import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { orderValidation } from '../middleware/validation';
import { requireAdmin } from '../middleware/permissions';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Stats and bulk operations must come before :id routes
router.get('/stats', orderController.getOrderStats as any);
router.get('/deleted', requireAdmin as any, orderController.getDeletedOrders as any);
router.post('/bulk-delete', requireAdmin as any, orderController.bulkDeleteOrders as any);

router.get('/', orderController.getAllOrders as any);
router.get('/:id', orderController.getOrderById as any);
router.post('/', orderValidation.create, orderController.createOrder as any);
router.put('/:id', orderValidation.update, orderController.updateOrder as any);
router.put('/:id/status', orderValidation.updateStatus, orderController.updateOrderStatus as any);
router.delete('/:id', requireAdmin as any, orderController.deleteOrder as any);

export default router;
