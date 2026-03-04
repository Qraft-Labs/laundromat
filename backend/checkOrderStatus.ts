import { query } from './src/config/database';

async function checkOrderStatus() {
  try {
    // Check order payment status
    const orderResult = await query(
      `SELECT order_number, payment_status, amount_paid, total_amount, balance, updated_at
       FROM orders 
       WHERE order_number = 'ORD20260001'`
    );
    
    console.log('\n===== ORDER STATUS =====');
    console.log(orderResult.rows[0]);
    
    // Check payment transactions
    const paymentsResult = await query(
      `SELECT p.id, p.amount, p.payment_method, p.payment_date, p.notes, u.full_name as received_by
       FROM payments p
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN orders o ON p.order_id = o.id
       WHERE o.order_number = 'ORD20260001'
       ORDER BY p.payment_date DESC`
    );
    
    console.log('\n===== PAYMENT TRANSACTIONS =====');
    console.log(paymentsResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrderStatus();
