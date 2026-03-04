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

async function finalCleanup() {
  try {
    console.log('🧹 Final cleanup of test orders...\n');

    // Delete remaining test orders
    const result = await pool.query(`
      DELETE FROM orders 
      WHERE order_number IN ('ORD-20260104-7', 'ORD-20260104-56')
      RETURNING order_number
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Deleted ${result.rows.length} test orders:`);
      result.rows.forEach(row => console.log(`   - ${row.order_number}`));
    } else {
      console.log('ℹ️  No test orders found (already cleaned)');
    }

    console.log('\n✅ Final cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

finalCleanup();
