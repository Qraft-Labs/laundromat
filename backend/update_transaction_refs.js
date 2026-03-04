require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function updateTransactionReferences() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating transaction references for existing orders...\n');

    // Update MTN Mobile Money orders
    const mtnResult = await client.query(`
      UPDATE orders 
      SET transaction_reference = 'MP' || LPAD(FLOOR(RANDOM() * 1000000000000)::TEXT, 12, '0')
      WHERE payment_method = 'MOBILE_MONEY_MTN' 
        AND amount_paid > 0 
        AND transaction_reference IS NULL
      RETURNING id
    `);
    console.log(`✅ Updated ${mtnResult.rowCount} MTN Mobile Money orders`);

    // Update Airtel Money orders
    const airtelResult = await client.query(`
      UPDATE orders 
      SET transaction_reference = 'AM' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0')
      WHERE payment_method = 'MOBILE_MONEY_AIRTEL' 
        AND amount_paid > 0 
        AND transaction_reference IS NULL
      RETURNING id
    `);
    console.log(`✅ Updated ${airtelResult.rowCount} Airtel Money orders`);

    // Update Bank Transfer orders
    const bankResult = await client.query(`
      UPDATE orders 
      SET transaction_reference = 'BT' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0')
      WHERE payment_method = 'BANK_TRANSFER' 
        AND amount_paid > 0 
        AND transaction_reference IS NULL
      RETURNING id
    `);
    console.log(`✅ Updated ${bankResult.rowCount} Bank Transfer orders`);

    // Verify updates
    const verifyResult = await client.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        COUNT(transaction_reference) as with_reference
      FROM orders 
      WHERE amount_paid > 0 
        AND payment_method IN ('MOBILE_MONEY_MTN', 'MOBILE_MONEY_AIRTEL', 'BANK_TRANSFER')
      GROUP BY payment_method
    `);

    console.log('\n📊 Verification:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.payment_method}: ${row.with_reference}/${row.count} have transaction references`);
    });

    console.log('\n✨ Transaction references updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateTransactionReferences();
