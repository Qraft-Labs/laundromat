const { Client } = require('pg');

/**
 * Migration: Add Bargain Deduction Feature
 * 
 * Adds bargain_amount column to orders table for fixed-amount price reductions
 * Allows staff to apply negotiated price reductions during order creation
 */

async function up() {
  const client = new Client({
    user: 'postgres',
    password: '551129',
    host: 'localhost',
    port: 5432,
    database: 'lush_laundry',
  });
  
  try {
    await client.connect();
    await client.query('BEGIN');
    
    console.log('🔧 Adding bargain deduction feature...');
    
    // 1. Add bargain_amount to orders table
    console.log('   Adding bargain_amount column to orders...');
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS bargain_amount INTEGER DEFAULT 0 NOT NULL;
    `);
    
    // 2. Add bargain limits to users table (role-based)
    console.log('   Adding bargain limit columns to users...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS max_bargain_amount INTEGER DEFAULT 0 NOT NULL;
    `);
    
    // 3. Set default bargain limits per role
    console.log('   Setting default bargain limits by role...');
    
    // Desktop Agents: Up to 5,000 UGX bargain
    await client.query(`
      UPDATE users 
      SET max_bargain_amount = 5000 
      WHERE role = 'DESKTOP_AGENT' AND max_bargain_amount = 0;
    `);
    
    // Managers: Up to 10,000 UGX bargain
    await client.query(`
      UPDATE users 
      SET max_bargain_amount = 10000 
      WHERE role = 'MANAGER' AND max_bargain_amount = 0;
    `);
    
    // Admins: Up to 50,000 UGX bargain
    await client.query(`
      UPDATE users 
      SET max_bargain_amount = 50000 
      WHERE role = 'ADMIN' AND max_bargain_amount = 0;
    `);
    
    // 4. Add comment for documentation
    await client.query(`
      COMMENT ON COLUMN orders.bargain_amount IS 
      'Fixed amount reduction for price negotiation/bargaining (in cents). Applied after discount.';
    `);
    
    await client.query(`
      COMMENT ON COLUMN users.max_bargain_amount IS 
      'Maximum bargain deduction this user can apply to orders (in cents). Role-based limit.';
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ Bargain deduction feature added successfully!');
    console.log('\n📊 Default Bargain Limits:');
    console.log('   Desktop Agent: UGX 5,000');
    console.log('   Manager:       UGX 10,000');
    console.log('   Admin:         UGX 50,000');
    console.log('\n💡 Bargain amount is a FIXED reduction, not a percentage');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function down() {
  const client = new Client({
    user: 'postgres',
    password: '551129',
    host: 'localhost',
    port: 5432,
    database: 'lush_laundry',
  });
  
  try {
    await client.connect();
    await client.query('BEGIN');
    
    console.log('🔧 Removing bargain deduction feature...');
    
    await client.query('ALTER TABLE orders DROP COLUMN IF EXISTS bargain_amount;');
    await client.query('ALTER TABLE users DROP COLUMN IF EXISTS max_bargain_amount;');
    
    await client.query('COMMIT');
    console.log('✅ Bargain deduction feature removed');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration
if (require.main === module) {
  up()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { up, down };
