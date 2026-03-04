import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { userValidation } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Get all users (Admin only)
router.get('/', authorize(UserRole.ADMIN) as any, userController.getAllUsers as any);

// Get user by ID (Admin only)
router.get('/:id', authorize(UserRole.ADMIN) as any, userController.getUserById as any);

// Update user (Admin or self)
router.put('/:id', userValidation.update, userController.updateUser as any);

// Approve user (Admin only)
router.put('/:id/approve', authorize(UserRole.ADMIN) as any, userValidation.approve, userController.approveUser as any);

// Change user role (Admin only)
router.put('/:id/role', authorize(UserRole.ADMIN) as any, userValidation.changeRole, userController.changeUserRole as any);

// Delete user (Admin only)
router.delete('/:id', authorize(UserRole.ADMIN) as any, userController.deleteUser as any);

// Get user notification preferences (authenticated user)
router.get('/preferences/me', userController.getUserPreferences as any);

// Update user notification preferences (authenticated user)
router.put('/preferences/me', userController.updateUserPreferences as any);

export default router;
