const { query } = require('./dist/config/database');

(async () => {
  try {
    console.log('\n🔍 VERIFYING PAYMENT METHODS DATA...\n');
    
    // Query with consolidated payment methods
    const result = await query(`
      SELECT 
        CASE 
          WHEN payment_method IN ('MOBILE_MONEY_MTN', 'MTN Mobile Money') THEN 'Mobile Money (MTN)'
          WHEN payment_method IN ('MOBILE_MONEY_AIRTEL', 'Airtel Money') THEN 'Mobile Money (Airtel)'
          WHEN payment_method = 'BANK_TRANSFER' THEN 'Bank Transfer'
          WHEN payment_method = 'CASH' THEN 'Cash'
          ELSE payment_method
        END as method,
        COUNT(*) as transaction_count,
        COALESCE(SUM(amount), 0) as total_amount
       FROM payments
       GROUP BY method
       ORDER BY total_amount DESC
    `);
    
    console.log('=== CONSOLIDATED PAYMENT METHODS (REAL DATABASE) ===\n');
    console.table(result.rows);
    
    // Calculate totals
    const totalAmount = result.rows.reduce((sum, row) => sum + parseFloat(row.total_amount), 0);
    const totalTransactions = result.rows.reduce((sum, row) => sum + parseInt(row.transaction_count), 0);
    
    console.log('\n✅ VERIFICATION RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Total Transactions:', totalTransactions);
    console.log('Total Amount: UGX', totalAmount.toLocaleString());
    console.log('\n💰 BREAKDOWN:');
    result.rows.forEach(row => {
      const percentage = ((parseFloat(row.total_amount) / totalAmount) * 100).toFixed(2);
      console.log(`   ${row.method}: UGX ${parseFloat(row.total_amount).toLocaleString()} (${percentage}%) - ${row.transaction_count} transactions`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Verify against grand total
    const grandTotal = await query('SELECT COUNT(*) as count, SUM(amount) as total FROM payments');
    console.log('✅ DATABASE VERIFICATION:');
    console.log('   Database Total:', grandTotal.rows[0].count, 'transactions');
    console.log('   Database Amount: UGX', parseFloat(grandTotal.rows[0].total).toLocaleString());
    
    if (totalTransactions === parseInt(grandTotal.rows[0].count)) {
      console.log('\n✅✅✅ PERFECT! All transactions accounted for!');
    } else {
      console.log('\n⚠️ WARNING: Transaction count mismatch!');
    }
    
    if (totalAmount === parseFloat(grandTotal.rows[0].total)) {
      console.log('✅✅✅ PERFECT! All money accounted for!\n');
    } else {
      console.log('⚠️ WARNING: Amount mismatch!\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
