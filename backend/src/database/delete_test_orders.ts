import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function investigateOrders() {
  try {
    // Get the problematic orders
    const orders = await pool.query(`
      SELECT 
        o.id, 
        o.order_number, 
        o.total_amount,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT COALESCE(SUM(total_price), 0) FROM order_items WHERE order_id = o.id) as calculated_total
      FROM orders o
      WHERE o.order_number IN ('ORD20260870', 'ORD20260871', 'ORD20260872', 'ORD20260873', 'ORD20260874')
    `);
    
    console.log('Investigating problematic orders:\n');
    for (const order of orders.rows) {
      console.log(`Order: ${order.order_number}`);
      console.log(`  Total in DB: UGX ${order.total_amount}`);
      console.log(`  Item Count: ${order.item_count}`);
      console.log(`  Calculated Total: UGX ${order.calculated_total}`);
      console.log('');
    }
    
    // Delete these test orders
    console.log('Deleting these incomplete test orders...\n');
    const result = await pool.query(`
      DELETE FROM orders
      WHERE order_number IN ('ORD20260870', 'ORD20260871', 'ORD20260872', 'ORD20260873', 'ORD20260874')
      RETURNING order_number
    `);
    
    console.log(`✅ Deleted ${result.rows.length} orders:`, result.rows.map(r => r.order_number).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

investigateOrders();
