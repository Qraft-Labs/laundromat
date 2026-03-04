const { query } = require('./dist/config/database');

(async () => {
  try {
    console.log('\n🔍 VERIFYING FINANCIAL DASHBOARD DATA INTEGRITY...\n');
    
    // 1. Check orders total
    const ordersTotal = await query(`
      SELECT 
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue,
        SUM(amount_paid) as amount_paid,
        SUM(balance) as balance
      FROM orders
    `);
    
    console.log('=== ORDERS TABLE ===');
    console.table(ordersTotal.rows);
    
    // 2. Check payments total
    const paymentsTotal = await query(`
      SELECT 
        COUNT(*) as payment_count,
        SUM(amount) as total_payments
      FROM payments
    `);
    
    console.log('\n=== PAYMENTS TABLE ===');
    console.table(paymentsTotal.rows);
    
    // 3. Check payment methods breakdown
    const paymentMethods = await query(`
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
    
    console.log('\n=== PAYMENT METHODS BREAKDOWN ===');
    console.table(paymentMethods.rows);
    
    // 4. Verify calculations
    const paymentMethodsSum = paymentMethods.rows.reduce((sum, row) => 
      sum + parseFloat(row.total_amount), 0
    );
    
    const paymentsTableTotal = parseFloat(paymentsTotal.rows[0].total_payments);
    const ordersAmountPaid = parseFloat(ordersTotal.rows[0].amount_paid);
    
    console.log('\n✅ VERIFICATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Orders Total Revenue:    UGX', parseFloat(ordersTotal.rows[0].total_revenue).toLocaleString());
    console.log('Orders Amount Paid:      UGX', ordersAmountPaid.toLocaleString());
    console.log('Orders Balance:          UGX', parseFloat(ordersTotal.rows[0].balance).toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Payments Table Total:    UGX', paymentsTableTotal.toLocaleString());
    console.log('Payment Methods Sum:     UGX', paymentMethodsSum.toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Validation checks
    console.log('\n📊 DATA INTEGRITY CHECKS:');
    
    if (paymentsTableTotal === paymentMethodsSum) {
      console.log('✅ Payment methods sum matches payments table total');
    } else {
      console.log('❌ MISMATCH: Payment methods sum vs payments table');
    }
    
    if (Math.abs(ordersAmountPaid - paymentsTableTotal) < 1) {
      console.log('✅ Orders amount_paid matches payments total');
    } else {
      console.log('⚠️  WARNING: Orders amount_paid differs from payments total');
      console.log('   Difference:', (ordersAmountPaid - paymentsTableTotal).toLocaleString(), 'UGX');
    }
    
    // Check expenses
    const expenses = await query(`
      SELECT 
        COUNT(*) as count,
        SUM(amount) as total
      FROM expenses
      WHERE status = 'APPROVED'
    `);
    
    console.log('\n=== EXPENSES (APPROVED) ===');
    console.table(expenses.rows);
    
    console.log('\n💰 PROFIT CALCULATION:');
    const revenue = parseFloat(ordersTotal.rows[0].total_revenue);
    const expenseTotal = parseFloat(expenses.rows[0].total);
    const profit = revenue - expenseTotal;
    const margin = (profit / revenue * 100).toFixed(2);
    
    console.log('Revenue:       UGX', revenue.toLocaleString());
    console.log('Expenses:      UGX', expenseTotal.toLocaleString());
    console.log('Net Profit:    UGX', profit.toLocaleString());
    console.log('Profit Margin:', margin + '%');
    
    console.log('\n✅ ALL DATA IS FROM REAL DATABASE TABLES!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
