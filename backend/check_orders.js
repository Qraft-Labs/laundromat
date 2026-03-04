require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkOrders() {
  try {
    const result = await pool.query('SELECT COUNT(*) as order_count FROM orders');
    console.log('📊 Current orders in database:', result.rows[0].order_count);
    
    const paymentResult = await pool.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount_paid) as total_paid
      FROM orders 
      WHERE amount_paid > 0
      GROUP BY payment_method
    `);
    
    console.log('\n💰 Payments by method:');
    paymentResult.rows.forEach(row => {
      console.log(`  ${row.payment_method}: ${row.count} transactions, UGX ${parseInt(row.total_paid).toLocaleString()}`);
    });
    
    const refResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE transaction_reference IS NOT NULL
    `);
    console.log(`\n🔖 Orders with transaction references: ${refResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrders();
