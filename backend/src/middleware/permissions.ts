import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Permission Middleware
 * Protects routes that require specific permissions
 */

/**
 * Require ADMIN role only
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Administrator privileges required for this action'
    });
  }

  next();
};

/**
 * Require ADMIN or MANAGER role
 */
export const requireAdminOrManager = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'This action requires administrator or manager privileges'
    });
  }

  next();
};

/**
 * Require permission to delete customers
 */
export const canDeleteCustomers = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators can delete customers'
    });
  }

  next();
};

/**
 * Require permission to edit customers
 */
export const canEditCustomers = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators can edit customers'
    });
  }

  next();
};

/**
 * Require permission to manage prices
 */
export const canManagePrices = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators can add, edit, or delete prices'
    });
  }

  next();
};

/**
 * Require permission to cancel orders
 */
export const canCancelOrders = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators can cancel orders'
    });
  }

  next();
};

/**
 * Require permission to access reports (Admin only)
 */
export const canAccessReports = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators and managers can access reports'
    });
  }

  next();
};

/**
 * Require permission to access inventory (Admin or Manager)
 */
export const canAccessInventory = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators and managers can access inventory'
    });
  }

  next();
};

/**
 * Require permission to access settings
 */
export const canAccessSettings = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators can access settings'
    });
  }

  next();
};

/**
 * Require permission to manage users (Admin only)
 */
export const canManageUsers = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators can manage users'
    });
  }

  next();
};

/**
 * Require permission to approve expenses
 */
export const canApproveExpenses = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Only administrators can approve expenses'
    });
  }

  next();
};
