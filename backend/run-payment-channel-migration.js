const { query } = require('./dist/config/database');

(async () => {
  try {
    console.log('\n🔧 ADDING PAYMENT CHANNEL CLASSIFICATION...\n');
    
    // Execute each ALTER TABLE statement separately
    console.log('1. Adding payment_channel column...');
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_channel VARCHAR(50) DEFAULT 'MANUAL'`);
    
    console.log('2. Adding merchant_id column...');
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS merchant_id VARCHAR(100)`);
    
    console.log('3. Adding sender_phone column...');
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(20)`);
    
    console.log('4. Adding recipient_account column...');
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS recipient_account VARCHAR(20)`);
    
    console.log('5. Adding account_name column...');
    await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS account_name VARCHAR(100)`);
    
    console.log('6. Setting defaults for existing records...');
    await query(`UPDATE payments SET payment_channel = 'MANUAL' WHERE payment_channel IS NULL`);
    
    console.log('7. Making payment_channel NOT NULL...');
    await query(`ALTER TABLE payments ALTER COLUMN payment_channel SET NOT NULL`);
    
    console.log('8. Creating indexes...');
    await query(`CREATE INDEX IF NOT EXISTS idx_payments_channel ON payments(payment_channel)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_payments_recipient_account ON payments(recipient_account)`);
    
    console.log('\n✅ Payment channel classification added successfully!\n');
    
    // Verify the new columns
    console.log('=== VERIFYING NEW COLUMNS ===');
    const result = await query(`
      SELECT column_name, data_type, character_maximum_length, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payments'
      AND column_name IN ('payment_channel', 'merchant_id', 'sender_phone', 'recipient_account', 'account_name')
      ORDER BY column_name
    `);
    console.table(result.rows);
    
    // Show sample of how data looks now
    console.log('\n=== SAMPLE PAYMENT RECORDS (NEW STRUCTURE) ===');
    const samples = await query(`
      SELECT id, payment_method, payment_channel, recipient_account, account_name, transaction_reference, amount
      FROM payments
      LIMIT 5
    `);
    console.table(samples.rows);
    
    console.log('\n✅ Migration complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
})();
