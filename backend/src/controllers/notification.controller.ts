import { Request, Response } from 'express';
import { query } from '../config/database';
import { QueryResult } from 'pg';

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: Date;
  read_at: Date | null;
}

/**
 * Get all notifications for the authenticated user
 * Query params: limit (default 50), offset (default 0), unread_only (boolean)
 */
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unread_only === 'true';

    let sql = `
      SELECT 
        id, user_id, type, title, message, data, is_read, created_at, read_at
      FROM notifications
      WHERE user_id = $1
    `;

    const params: any[] = [userId];

    if (unreadOnly) {
      sql += ' AND is_read = FALSE';
    }

    sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    params.push(limit, offset);

    const result: QueryResult<Notification> = await query(sql, params);

    res.json({
      notifications: result.rows,
      total: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Get unread notification count for the authenticated user
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { notificationId } = req.params;

    // Verify notification belongs to user
    const checkResult = await query(
      'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await query(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = $1',
      [notificationId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read for the authenticated user
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({
      message: 'All notifications marked as read',
      updated: result.rowCount || 0,
    });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

/**
 * Delete a notification (admin only or own notification)
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';
    const { notificationId } = req.params;

    // Check if notification exists and belongs to user (unless admin)
    const checkResult = await query(
      'SELECT id, user_id FROM notifications WHERE id = $1',
      [notificationId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = checkResult.rows[0];

    // Only allow deletion if user owns it or is admin
    if (notification.user_id !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this notification' });
    }

    await query('DELETE FROM notifications WHERE id = $1', [notificationId]);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

/**
 * Delete all notifications for a user (admin only for other users, users can delete their own)
 */
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';
    const { userId: targetUserId } = req.body;

    // If targetUserId is provided, only admin can delete other users' notifications
    const deleteUserId = targetUserId || userId;

    if (targetUserId && targetUserId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete other users notifications' });
    }

    const result = await query('DELETE FROM notifications WHERE user_id = $1', [deleteUserId]);

    res.json({
      message: 'Notifications deleted successfully',
      deleted: result.rowCount || 0,
    });
  } catch (error) {
    console.error('Failed to delete notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
};

/**
 * Create a notification for a specific user or all users
 * Used internally by other controllers (e.g., when payment arrives)
 */
export const createNotification = async (
  userIds: number | number[] | 'all',
  type: string,
  title: string,
  message: string,
  data?: any
) => {
  try {
    let targetUserIds: number[] = [];

    if (userIds === 'all') {
      // Get all active users
      const usersResult = await query('SELECT id FROM users WHERE is_active = TRUE');
      targetUserIds = usersResult.rows.map((row) => row.id);
    } else if (Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else {
      targetUserIds = [userIds];
    }

    // Insert notification for each user
    const insertPromises = targetUserIds.map((userId) =>
      query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, type, title, message, JSON.stringify(data)]
      )
    );

    await Promise.all(insertPromises);

    return { success: true, notified: targetUserIds.length };
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

/**
 * Get notification statistics for admin dashboard
 */
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const isAdmin = (req as any).user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get total, read, unread counts by type
    const statsResult = await query(`
      SELECT 
        type,
        COUNT(*) as total,
        SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN NOT is_read THEN 1 ELSE 0 END) as unread_count
      FROM notifications
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY type
      ORDER BY total DESC
    `);

    // Get recent notifications across all users
    const recentResult = await query(`
      SELECT 
        n.id, n.type, n.title, n.created_at, n.is_read,
        u.name as user_name, u.email as user_email
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 20
    `);

    res.json({
      stats: statsResult.rows,
      recent: recentResult.rows,
    });
  } catch (error) {
    console.error('Failed to fetch notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
};
