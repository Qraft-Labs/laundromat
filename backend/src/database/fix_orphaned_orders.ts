import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function fixOrphanedOrders() {
  try {
    console.log('🔧 Fixing orders with missing order items...\n');
    
    // Find orders with no items
    const orphanedOrders = await pool.query(`
      SELECT o.id, o.order_number, o.total_amount, o.created_at
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.id IS NULL
      ORDER BY o.created_at DESC
    `);
    
    if (orphanedOrders.rows.length === 0) {
      console.log('✅ No orphaned orders found!');
      process.exit(0);
      return;
    }
    
    console.log(`Found ${orphanedOrders.rows.length} orders without items:\n`);
    orphanedOrders.rows.forEach(order => {
      console.log(`  • ${order.order_number} (ID: ${order.id}) - UGX ${order.total_amount} - ${new Date(order.created_at).toLocaleDateString()}`);
    });
    
    console.log('\n⚠️  These orders appear to be test data or incomplete orders.');
    console.log('✅ Recommendation: These should be deleted as they have no line items.\n');
    
    // Delete them
    const result = await pool.query(`
      DELETE FROM orders
      WHERE id IN (
        SELECT o.id
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.id IS NULL
      )
      RETURNING order_number
    `);
    
    console.log(`✅ Deleted ${result.rows.length} incomplete orders:`);
    result.rows.forEach(row => {
      console.log(`  • ${row.order_number}`);
    });
    
    console.log('\n✅ Database cleaned successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOrphanedOrders();
