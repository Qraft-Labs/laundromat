import { query } from './src/config/database';

async function checkOrderDetails() {
  try {
    // Check order
    const orderResult = await query(
      `SELECT * FROM orders WHERE order_number = 'ORD20260001'`
    );
    
    console.log('\n===== ORDER DETAILS =====');
    console.log(orderResult.rows[0]);
    
    // Check order items
    const itemsResult = await query(
      `SELECT oi.*, pi.name as item_name, pi.category
       FROM order_items oi
       LEFT JOIN price_items pi ON oi.price_item_id = pi.id
       WHERE oi.order_id = $1`,
      [orderResult.rows[0].id]
    );
    
    console.log('\n===== ORDER ITEMS =====');
    console.log(itemsResult.rows);
    console.log(`Total items: ${itemsResult.rows.length}`);
    
    // Check payment transactions
    const paymentsResult = await query(
      `SELECT p.*, u.full_name as received_by
       FROM payments p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.order_id = $1
       ORDER BY p.payment_date DESC`,
      [orderResult.rows[0].id]
    );
    
    console.log('\n===== PAYMENT TRANSACTIONS =====');
    console.log(paymentsResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrderDetails();
