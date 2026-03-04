import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function fixOrdersTable() {
  try {
    console.log('🔧 Adding missing columns to orders table...\n');

    // Add amount_paid column (tracks how much has been paid towards the order)
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 0
    `);
    console.log('✅ Added amount_paid column');

    // Add payment_status column (tracks if order is UNPAID, PARTIAL, PAID, OVERPAID)
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE payment_status_type AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'OVERPAID');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_status payment_status_type DEFAULT 'UNPAID'
    `);
    console.log('✅ Added payment_status column');

    console.log('\n✅ Orders table updated successfully!');
    console.log('\n📋 Orders table now supports:');
    console.log('   - Payment tracking (amount_paid)');
    console.log('   - Payment status (UNPAID/PARTIAL/PAID/OVERPAID)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing orders table:', error);
    process.exit(1);
  }
}

fixOrdersTable();
