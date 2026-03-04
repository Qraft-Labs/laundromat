const { query } = require('./dist/config/database');

(async () => {
  try {
    const result = await query(
      `SELECT o.id, o.order_number, o.order_status, o.updated_at, 
              c.name as customer_name, c.phone as customer_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.order_status = 'READY' 
       ORDER BY o.updated_at DESC 
       LIMIT 5`
    );
    console.log('\n=== Recent READY Orders ===');
    console.log(`Found ${result.rows.length} READY orders:\n`);
    result.rows.forEach(order => {
      console.log(`Order: ${order.order_number}`);
      console.log(`Customer: ${order.customer_name}`);
      console.log(`Phone: ${order.customer_phone}`);
      console.log(`Updated: ${order.updated_at}`);
      console.log('---');
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
