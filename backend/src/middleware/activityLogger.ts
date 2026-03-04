import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from './auth';

/**
 * Middleware to automatically log activities for auditing
 * Attach to routes that need activity tracking
 */
export const logActivity = (action: string, resourceType?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function to log after successful response
    res.send = function(data: any) {
      // Only log on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract resource ID from params, body, or response
        let resourceId = req.params.id || req.params.userId || req.params.orderId || req.params.customerId;
        
        // Try to get ID from response data if available
        if (!resourceId && typeof data === 'string') {
          try {
            const jsonData = JSON.parse(data);
            resourceId = jsonData.id || jsonData.order?.id || jsonData.customer?.id || jsonData.user?.id;
          } catch (e) {
            // Not JSON, ignore
          }
        }
        
        // Build details object
        const details: any = {
          method: req.method,
          path: req.path,
          status: res.statusCode,
        };
        
        // Add relevant data from request body (sanitize sensitive info)
        if (req.body) {
          const sanitizedBody = { ...req.body };
          delete sanitizedBody.password;
          delete sanitizedBody.token;
          details.request_data = sanitizedBody;
        }
        
        // Add query params if present
        if (Object.keys(req.query).length > 0) {
          details.query_params = req.query;
        }
        
        // Log activity asynchronously (don't wait for it)
        query(
          `INSERT INTO activity_logs (user_id, user_email, user_name, user_role, action, resource_type, resource_id, details, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            req.user?.id || null,
            req.user?.email || 'anonymous',
            req.user?.full_name || 'Anonymous',
            req.user?.role || 'GUEST',
            action,
            resourceType || null,
            resourceId || null,
            JSON.stringify(details),
            req.ip || 'unknown',
            req.headers['user-agent'] || 'unknown'
          ]
        ).catch(err => {
          console.error('Failed to log activity:', err);
          // Don't fail the request if logging fails
        });
      }
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Log critical actions that should always be tracked
 * Use this for sensitive operations
 */
export const logCriticalAction = (action: string, resourceType: string, additionalDetails?: any) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.id || req.params.userId || req.params.orderId || req.params.customerId;
      
      const details: any = {
        method: req.method,
        path: req.path,
        ...additionalDetails,
      };
      
      // Add sanitized request body
      if (req.body) {
        const sanitizedBody = { ...req.body };
        delete sanitizedBody.password;
        delete sanitizedBody.token;
        details.request_data = sanitizedBody;
      }
      
      await query(
        `INSERT INTO activity_logs (user_id, user_email, user_name, user_role, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          req.user?.id || null,
          req.user?.email || 'anonymous',
          req.user?.full_name || 'Anonymous',
          req.user?.role || 'GUEST',
          action,
          resourceType,
          resourceId || null,
          JSON.stringify(details),
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        ]
      );
      
      next();
    } catch (error) {
      console.error('Failed to log critical action:', error);
      // Still proceed with request even if logging fails
      next();
    }
  };
};

/**
 * Helper function to manually log an activity from anywhere in the code
 */
export const manualLogActivity = async (
  userId: number | null,
  userEmail: string,
  userName: string,
  userRole: string,
  action: string,
  resourceType: string | null,
  resourceId: number | null,
  details: any,
  ipAddress: string = 'unknown'
) => {
  try {
    await query(
      `INSERT INTO activity_logs (user_id, user_email, user_name, user_role, action, resource_type, resource_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, userEmail, userName, userRole, action, resourceType, resourceId, JSON.stringify(details), ipAddress]
    );
  } catch (error) {
    console.error('Failed to manually log activity:', error);
  }
};
