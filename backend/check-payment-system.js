const { query } = require('./dist/config/database');

(async () => {
  try {
    console.log('\n📋 CHECKING PAYMENT SYSTEM DETAILS...\n');
    
    // 1. Check payments table structure
    console.log('=== PAYMENTS TABLE STRUCTURE ===');
    const structure = await query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      ORDER BY ordinal_position
    `);
    console.table(structure.rows);
    
    // 2. Sample payment records
    console.log('\n=== SAMPLE PAYMENT RECORDS ===');
    const samples = await query(`
      SELECT id, order_id, amount, payment_method, payment_date, transaction_reference, notes
      FROM payments 
      ORDER BY payment_date DESC
      LIMIT 5
    `);
    console.table(samples.rows);
    
    // 3. Check if there's a field for mobile money account
    console.log('\n=== MOBILE MONEY ACCOUNT TRACKING ===');
    const mtnPayments = await query(`
      SELECT id, payment_method, transaction_reference, notes, amount
      FROM payments 
      WHERE payment_method LIKE '%MTN%'
      LIMIT 3
    `);
    console.table(mtnPayments.rows);
    
    // 4. Check orders table for payment tracking
    console.log('\n=== ORDERS PAYMENT STATUS ===');
    const orderPayments = await query(`
      SELECT payment_status, COUNT(*) as count, SUM(total_amount) as total, SUM(amount_paid) as paid, SUM(balance) as balance
      FROM orders
      GROUP BY payment_status
    `);
    console.table(orderPayments.rows);
    
    console.log('\n✅ System Analysis Complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
