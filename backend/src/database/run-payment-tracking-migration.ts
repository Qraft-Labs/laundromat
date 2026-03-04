import pool from '../config/database';

async function addPaymentTracking() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding payment tracking fields to deliveries table...');
    
    // Read and execute the SQL migration
    const fs = require('fs');
    const path = require('path');
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'add-payment-tracking.sql'),
      'utf8'
    );
    
    await client.query(sqlFile);
    
    console.log('✅ Payment tracking fields added successfully!');
    console.log('\n📊 New fields:');
    console.log('   - payment_amount: Actual amount paid');
    console.log('   - payment_method: CASH, MOBILE_MONEY, CARD, BANK_TRANSFER');
    console.log('   - payment_status: PENDING, PAID, PARTIAL, REFUNDED');
    console.log('   - payment_date: Timestamp of payment');
    console.log('   - payment_notes: Additional payment information');
    
    // Count existing deliveries
    const result = await client.query('SELECT COUNT(*) FROM deliveries');
    const count = parseInt(result.rows[0].count);
    
    console.log(`\n✅ Updated ${count} existing deliveries with payment information`);
    
  } catch (error) {
    console.error('❌ Error adding payment tracking:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPaymentTracking();
