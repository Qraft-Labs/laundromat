const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'lush_laundry',
});

async function addTransactionReference() {
  try {
    console.log('Adding transaction_reference column to orders table...');

    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'transaction_reference'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ transaction_reference column already exists');
    } else {
      // Add transaction_reference column
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN transaction_reference VARCHAR(100)
      `);
      console.log('✅ Added transaction_reference column to orders table');
    }

    // Add comment
    await pool.query(`
      COMMENT ON COLUMN orders.transaction_reference IS 
      'Transaction reference number for mobile money or bank transfers'
    `);

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addTransactionReference();
