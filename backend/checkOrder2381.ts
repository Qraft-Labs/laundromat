import { query } from './src/config/database';

async function checkOrder() {
  const result = await query(`
    SELECT 
      id,
      order_number,
      total_amount,
      amount_paid,
      balance,
      payment_status,
      created_at,
      updated_at
    FROM orders 
    WHERE order_number = 'ORD20262381'
  `);
  
  console.log('\n===== ORDER ORD20262381 =====');
  if (result.rows.length > 0) {
    const order = result.rows[0];
    console.log('ID:', order.id);
    console.log('Order Number:', order.order_number);
    console.log('Total Amount:', order.total_amount, '(type:', typeof order.total_amount, ')');
    console.log('Amount Paid:', order.amount_paid, '(type:', typeof order.amount_paid, ')');
    console.log('Balance:', order.balance, '(type:', typeof order.balance, ')');
    console.log('Payment Status:', order.payment_status);
    console.log('Created:', order.created_at);
    console.log('Updated:', order.updated_at);
  } else {
    console.log('Order not found');
  }
  
  process.exit(0);
}

checkOrder();
