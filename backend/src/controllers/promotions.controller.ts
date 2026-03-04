import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { sendBulkPromo } from '../services/sms.service';

/**
 * Get all promotions
 */
export const getAllPromotions = async (req: AuthRequest, res: Response) => {
  try {
    const { active_only } = req.query;
    
    let sql = 'SELECT * FROM promotions';
    const values: any[] = [];
    
    if (active_only === 'true') {
      sql += ' WHERE is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, values);
    
    res.json({
      promotions: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
};

/**
 * Get single promotion by ID
 */
export const getPromotionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM promotions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json({ promotion: result.rows[0] });
  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({ error: 'Failed to fetch promotion' });
  }
};

/**
 * Create new promotion
 */
export const createPromotion = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      discount_percentage,
      start_date,
      end_date,
      message,
    } = req.body;
    
    const userId = req.user?.id;
    
    const result = await query(
      `INSERT INTO promotions (
        name, 
        description, 
        discount_percentage, 
        start_date, 
        end_date, 
        message, 
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [name, description, discount_percentage, start_date, end_date, message, userId]
    );
    
    res.status(201).json({
      message: 'Promotion created successfully',
      promotion: result.rows[0],
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
};

/**
 * Update promotion
 */
export const updatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      name,
      description,
      discount_percentage,
      start_date,
      end_date,
      message,
      is_active,
    } = req.body;
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (discount_percentage !== undefined) {
      updates.push(`discount_percentage = $${paramCount++}`);
      values.push(discount_percentage);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(end_date);
    }
    if (message !== undefined) {
      updates.push(`message = $${paramCount++}`);
      values.push(message);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const result = await query(
      `UPDATE promotions SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json({
      message: 'Promotion updated successfully',
      promotion: result.rows[0],
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
};

/**
 * Activate promotion and send SMS to all customers
 */
export const activatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get promotion details
    const promotionResult = await query(
      'SELECT * FROM promotions WHERE id = $1',
      [id]
    );
    
    if (promotionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    const promotion = promotionResult.rows[0];
    
    // Check if already sent
    if (promotion.sms_sent) {
      return res.status(400).json({ 
        error: 'SMS already sent for this promotion',
        sent_at: promotion.sms_sent_at,
      });
    }
    
    // Activate the promotion
    await query(
      'UPDATE promotions SET is_active = TRUE, updated_at = NOW() WHERE id = $1',
      [id]
    );
    
    // Get all active customers with phone numbers
    const customersResult = await query(
      'SELECT name, phone FROM customers WHERE is_active = TRUE AND phone IS NOT NULL AND phone != \'\'',
      []
    );
    
    const customers = customersResult.rows.map((c: any) => ({
      name: c.name,
      phone: c.phone,
    }));
    
    if (customers.length === 0) {
      return res.status(400).json({ 
        error: 'No customers with phone numbers found',
      });
    }
    
    console.log(`📱 Sending promotional SMS to ${customers.length} customers...`);
    
    // Send bulk SMS (asynchronously)
    sendBulkPromo(customers, promotion.message)
      .then((result) => {
        console.log(`✅ Promotional SMS sent: ${result.sent} sent, ${result.failed} failed`);
        
        // Mark as sent
        query(
          'UPDATE promotions SET sms_sent = TRUE, sms_sent_at = NOW() WHERE id = $1',
          [id]
        );
      })
      .catch((error) => {
        console.error(`❌ Failed to send promotional SMS:`, error);
      });
    
    res.json({
      message: 'Promotion activated and SMS sending initiated',
      customers_count: customers.length,
      promotion: promotion,
    });
  } catch (error) {
    console.error('Activate promotion error:', error);
    res.status(500).json({ error: 'Failed to activate promotion' });
  }
};

/**
 * Delete promotion
 */
export const deletePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM promotions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
};
