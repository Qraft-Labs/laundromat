const { query } = require('./dist/config/database');

(async () => {
  try {
    console.log('\n🔧 UPDATING PENDING PAYMENTS TABLE...\n');
    
    console.log('1. Adding payment_channel column...');
    await query(`ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS payment_channel VARCHAR(50) DEFAULT 'MERCHANT'`);
    
    console.log('2. Adding recipient_account column...');
    await query(`ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS recipient_account VARCHAR(20)`);
    
    console.log('3. Adding merchant_id column...');
    await query(`ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS merchant_id VARCHAR(100)`);
    
    console.log('4. Setting defaults...');
    await query(`UPDATE pending_payments SET payment_channel = 'MERCHANT' WHERE payment_channel IS NULL`);
    
    console.log('5. Making payment_channel NOT NULL...');
    await query(`ALTER TABLE pending_payments ALTER COLUMN payment_channel SET NOT NULL`);
    
    console.log('6. Creating indexes...');
    await query(`CREATE INDEX IF NOT EXISTS idx_pending_payments_channel ON pending_payments(payment_channel)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pending_payments_recipient_account ON pending_payments(recipient_account)`);
    
    console.log('\n✅ Pending payments table updated successfully!\n');
    
    // Show structure
    console.log('=== UPDATED PENDING_PAYMENTS STRUCTURE ===');
    const result = await query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'pending_payments'
      ORDER BY ordinal_position
    `);
    console.table(result.rows);
    
    console.log('\n✅ Ready for API integration!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
