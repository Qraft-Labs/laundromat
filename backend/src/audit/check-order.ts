import { query } from '../config/database';

async function checkOrder() {
  try {
    console.log('Checking order ORD20260135...\n');
    
    const result = await query('SELECT * FROM orders WHERE order_number = $1', ['ORD20260135']);
    const order = result.rows[0];
    
    console.log('Order Details:');
    console.log('─'.repeat(70));
    console.log(`Order Number: ${order.order_number}`);
    console.log(`Subtotal: ${order.subtotal}`);
    console.log(`Discount: ${order.discount}`);
    console.log(`Discount Percentage: ${order.discount_percentage}`);
    console.log(`Discount Amount: ${order.discount_amount}`);
    console.log(`Total Amount: ${order.total_amount}`);
    console.log(`Amount Paid: ${order.amount_paid}`);
    console.log(`Balance: ${order.balance}`);
    console.log();
    
    // Calculate expected
    const expectedTotal = order.subtotal - order.discount_amount;
    console.log(`Expected Total: ${expectedTotal} (${order.subtotal} - ${order.discount_amount})`);
    console.log(`Actual Total: ${order.total_amount}`);
    console.log(`Match: ${expectedTotal === order.total_amount ? '✅ YES' : '❌ NO'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrder();
