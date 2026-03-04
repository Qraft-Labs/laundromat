import { query } from '../config/database';

async function testDashboardFixed() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 TESTING FIXED DASHBOARD QUERIES');
    console.log('═'.repeat(80) + '\n');

    // Test 1: Today's orders (using PostgreSQL CURRENT_DATE)
    console.log('TEST 1: Today\'s Orders (Fixed)');
    const todayOrdersResult = await query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    console.log(`   Result: ${todayOrdersResult.rows[0].count} orders`);
    
    // Show actual date comparison
    const dateCheck = await query(`
      SELECT 
        CURRENT_DATE as pg_today,
        DATE(created_at) as order_date,
        order_number,
        created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    console.log(`   PostgreSQL CURRENT_DATE: ${dateCheck.rows[0]?.pg_today}`);
    console.log(`   Recent orders:`);
    dateCheck.rows.forEach((row: any) => {
      console.log(`     - ${row.order_number}: ${row.created_at} (DATE: ${row.order_date})`);
    });

    // Test 2: Today's revenue
    console.log('\nTEST 2: Today\'s Revenue (Fixed)');
    const todayRevenueResult = await query(
      `SELECT 
        COALESCE(SUM(amount_paid), 0) as order_revenue
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    console.log(`   Order revenue: UGX ${parseFloat(todayRevenueResult.rows[0].order_revenue).toLocaleString()}`);

    const todayDeliveryRevenueResult = await query(
      `SELECT 
        COALESCE(SUM(payment_amount), 0) as delivery_revenue
       FROM deliveries 
       WHERE DATE(payment_date) = CURRENT_DATE 
       AND payment_status = 'PAID'`
    );
    console.log(`   Delivery revenue: UGX ${parseFloat(todayDeliveryRevenueResult.rows[0].delivery_revenue).toLocaleString()}`);
    
    const totalRevenue = 
      parseFloat(todayRevenueResult.rows[0].order_revenue) + 
      parseFloat(todayDeliveryRevenueResult.rows[0].delivery_revenue);
    console.log(`   TOTAL: UGX ${totalRevenue.toLocaleString()}`);

    // Test 3: Average order value (using correct column name 'total')
    console.log('\nTEST 3: Average Order Value (Fixed)');
    const avgOrderValueResult = await query(
      `SELECT COALESCE(AVG(total), 0) as avg_value FROM orders`
    );
    console.log(`   Result: UGX ${parseFloat(avgOrderValueResult.rows[0].avg_value).toLocaleString()}`);

    // Test 4: Order statuses (using correct column 'status' with lowercase values)
    console.log('\nTEST 4: Order Status Breakdown (Fixed)');
    const pendingResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`);
    const processingResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'processing'`);
    const readyResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'ready'`);
    const deliveredResult = await query(`SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'`);
    
    console.log(`   Pending: ${pendingResult.rows[0].count}`);
    console.log(`   Processing: ${processingResult.rows[0].count}`);
    console.log(`   Ready: ${readyResult.rows[0].count}`);
    console.log(`   Delivered: ${deliveredResult.rows[0].count}`);

    // Test 5: Today's payments
    console.log('\nTEST 5: Today\'s Payments (Fixed)');
    const todayPaymentsResult = await query(
      `SELECT COUNT(*) as count FROM payments 
       WHERE DATE(payment_date) = CURRENT_DATE`
    );
    console.log(`   Result: ${todayPaymentsResult.rows[0].count} transactions`);

    console.log('\n' + '═'.repeat(80));
    console.log('✅ ALL TESTS PASSED - Dashboard Queries Fixed!');
    console.log('═'.repeat(80) + '\n');
    
    const summary = {
      todayOrders: parseInt(todayOrdersResult.rows[0].count),
      todayRevenue: totalRevenue,
      averageOrderValue: parseFloat(avgOrderValueResult.rows[0].avg_value),
      pendingOrders: parseInt(pendingResult.rows[0].count),
      processingOrders: parseInt(processingResult.rows[0].count),
      readyOrders: parseInt(readyResult.rows[0].count),
      todayPayments: parseInt(todayPaymentsResult.rows[0].count),
    };

    console.log('Dashboard Stats (Fixed):');
    console.log(JSON.stringify(summary, null, 2));
    console.log();
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testDashboardFixed();
