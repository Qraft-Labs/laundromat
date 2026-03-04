import { query } from './src/config/database';

async function findOrder() {
  try {
    // Search for the order more broadly
    const orderResult = await query(
      `SELECT id, order_number, payment_status, amount_paid, total_amount, balance, created_at, updated_at
       FROM orders
       WHERE order_number = 'ORD20260001'
       OR id = 1`
    );
    
    console.log('\n===== SEARCHING FOR ORD20260001 =====');
    console.log(orderResult.rows);
    
    // Search for similar order numbers
    const similarResult = await query(
      `SELECT id, order_number, customer_id, payment_status, amount_paid, total_amount, balance
       FROM orders
       WHERE order_number LIKE '%0001%'
       ORDER BY created_at DESC
       LIMIT 10`
    );
    
    console.log('\n===== ORDERS WITH "0001" IN NUMBER =====');
    console.log(similarResult.rows);
    
    // Check customer Sarah Nakamya's orders
    const sarahOrders = await query(
      `SELECT o.id, o.order_number, o.payment_status, o.amount_paid, o.total_amount, o.balance, o.created_at
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE c.name ILIKE '%Sarah%Nakamya%'
       OR c.phone = '+256701234567'
       ORDER BY o.created_at DESC
       LIMIT 10`
    );
    
    console.log('\n===== SARAH NAKAMYA ORDERS =====');
    sarahOrders.rows.forEach(row => {
      console.log(`${row.order_number}: ${row.payment_status} - ${row.amount_paid}/${row.total_amount} (Created: ${row.created_at})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findOrder();
