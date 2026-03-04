import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';
import { customerValidation } from '../middleware/validation';
import { canEditCustomers, canDeleteCustomers } from '../middleware/permissions';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

router.get('/', customerController.getAllCustomers as any);
router.get('/stats/overview', customerController.getCustomerStats as any);
router.get('/check-duplicate', customerController.checkDuplicateCustomer as any);
router.get('/:id', customerController.getCustomerById as any);
router.post('/', customerValidation.create, customerController.createCustomer as any);
router.put('/:id', canEditCustomers as any, customerValidation.update, customerController.updateCustomer as any);
router.delete('/:id', canDeleteCustomers as any, customerController.deleteCustomer as any);

export default router;
