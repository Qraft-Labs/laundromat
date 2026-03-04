import { query } from '../config/database';

async function checkOrders() {
  const orders = await query(`
    SELECT order_number, subtotal, discount, discount_amount, total_amount,
           (subtotal - discount_amount) as correct_total
    FROM orders 
    WHERE order_number IN ('ORD20260101', 'ORD20260003', 'ORD20260179')
    ORDER BY order_number
  `);
  
  console.table(orders.rows);
  process.exit(0);
}

checkOrders();
