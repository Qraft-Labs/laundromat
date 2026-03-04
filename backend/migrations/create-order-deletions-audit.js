const { Client } = require('pg');

async function createOrderDeletionsAudit() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'lush_laundry',
    password: '551129',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database');

    // Create order_deletions audit table
    console.log('📝 Creating order_deletions audit table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_deletions (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        order_number VARCHAR(50) NOT NULL,
        customer_id INTEGER NOT NULL,
        customer_name VARCHAR(255),
        total_amount INTEGER NOT NULL,
        amount_paid INTEGER NOT NULL,
        balance INTEGER NOT NULL,
        payment_status VARCHAR(50),
        status VARCHAR(50),
        created_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NOW(),
        deleted_by INTEGER NOT NULL REFERENCES users(id),
        deleted_by_name VARCHAR(255),
        deletion_reason TEXT,
        order_items JSONB,
        payments JSONB,
        CONSTRAINT order_deletions_order_id_unique UNIQUE(order_id)
      )
    `);
    console.log('✅ order_deletions table created');

    // Create index for faster queries
    console.log('📝 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_deletions_deleted_at 
      ON order_deletions(deleted_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_deletions_deleted_by 
      ON order_deletions(deleted_by)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_deletions_customer_id 
      ON order_deletions(customer_id)
    `);
    console.log('✅ Indexes created');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration
createOrderDeletionsAudit()
  .then(() => {
    console.log('👍 Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
