require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function showSampleData() {
  try {
    console.log('📋 Sample Payment Data:\n');

    const result = await pool.query(`
      SELECT 
        o.order_number,
        c.name as customer,
        o.payment_method,
        o.amount_paid,
        o.transaction_reference,
        TO_CHAR(o.created_at, 'YYYY-MM-DD') as date
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.amount_paid > 0
      ORDER BY o.created_at DESC
      LIMIT 15
    `);

    console.log('Recent Payments:\n');
    result.rows.forEach((row, idx) => {
      const ref = row.transaction_reference || 'N/A';
      console.log(`${idx + 1}. ${row.date} | ${row.order_number}`);
      console.log(`   Customer: ${row.customer}`);
      console.log(`   Method: ${row.payment_method}`);
      console.log(`   Amount: UGX ${parseInt(row.amount_paid).toLocaleString()}`);
      console.log(`   Reference: ${ref}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showSampleData();
