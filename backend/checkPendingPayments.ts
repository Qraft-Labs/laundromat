import { query } from './src/config/database';

async function checkPendingPayments() {
  try {
    // Check all payment methods that might relate to this order
    // Look for payments around 475,000 UGX
    const pendingResult = await query(
      `SELECT id, amount, sender_phone, payment_method, transaction_reference, status, created_at
       FROM pending_payments
       WHERE amount >= 470000 AND amount <= 480000
       ORDER BY created_at DESC
       LIMIT 10`
    );
    
    console.log('\n===== PENDING PAYMENTS (around USh 475,000) =====');
    console.log(pendingResult.rows);
    
    // Check if there are any assigned payments for this order
    const assignedResult = await query(
      `SELECT id, amount, sender_phone, payment_method, status, assigned_to_order_id, created_at
       FROM pending_payments
       WHERE amount >= 470000 AND amount <= 480000 AND status = 'ASSIGNED'
       ORDER BY created_at DESC
       LIMIT 10`
    );
    
    console.log('\n===== ASSIGNED PAYMENTS (around USh 475,000) =====');
    console.log(assignedResult.rows);
    
    // Check the customer for this order
    const customerResult = await query(
      `SELECT c.name, c.phone, o.order_number
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.order_number = 'ORD20260001'`
    );
    
    console.log('\n===== CUSTOMER INFO =====');
    console.log(customerResult.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPendingPayments();
