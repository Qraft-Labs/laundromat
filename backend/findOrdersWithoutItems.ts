import { query } from './src/config/database';

async function findOrdersWithoutItems() {
  try {
    // Find orders that have total_amount > 0 but no order items
    const result = await query(
      `SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.payment_status,
        o.created_at,
        c.name as customer_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.total_amount > 0
       AND (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) = 0
       ORDER BY o.created_at DESC
       LIMIT 20`
    );
    
    console.log('\n===== ORDERS WITH NO ITEMS (but have total_amount) =====');
    console.log(`Found ${result.rows.length} orders with this issue:\n`);
    
    result.rows.forEach(row => {
      console.log(`${row.order_number} - ${row.customer_name}`);
      console.log(`  Amount: USh ${parseFloat(row.total_amount).toLocaleString()}`);
      console.log(`  Status: ${row.payment_status}`);
      console.log(`  Created: ${row.created_at}`);
      console.log(`  Items: ${row.item_count}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findOrdersWithoutItems();
