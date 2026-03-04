import { query } from './src/config/database';

async function checkAllPayments() {
  try {
    // Check all payments from the last 5 days
    const paymentsResult = await query(
      `SELECT 
        p.id, 
        p.amount, 
        p.payment_date,
        p.payment_method,
        p.transaction_reference,
        o.order_number,
        c.name as customer_name,
        u.full_name as received_by
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.payment_date >= CURRENT_DATE - INTERVAL '5 days'
       ORDER BY p.payment_date DESC
       LIMIT 20`
    );
    
    console.log('\n===== RECENT PAYMENTS (Last 5 days) =====');
    paymentsResult.rows.forEach(row => {
      console.log(`
Order: ${row.order_number}
Customer: ${row.customer_name}
Amount: USh ${row.amount}
Method: ${row.payment_method}
Date: ${row.payment_date}
Received By: ${row.received_by}
---`);
    });
    
    // Check order history for ORD20260001
    const orderHistory = await query(
      `SELECT id, order_number, payment_status, amount_paid, total_amount, balance, created_at, updated_at
       FROM orders
       WHERE order_number LIKE 'ORD2026%'
       ORDER BY created_at DESC
       LIMIT 10`
    );
    
    console.log('\n===== RECENT ORDERS (2026) =====');
    orderHistory.rows.forEach(row => {
      console.log(`${row.order_number}: ${row.payment_status} - Paid: ${row.amount_paid}/${row.total_amount}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllPayments();
