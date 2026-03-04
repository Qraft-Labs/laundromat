import { query } from '../config/database';

async function testDashboardStats() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 TESTING DASHBOARD DATA');
    console.log('═'.repeat(80) + '\n');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('📅 Date Range:');
    console.log(`   Today: ${today.toISOString()}`);
    console.log(`   Tomorrow: ${tomorrow.toISOString()}\n`);

    // Test 1: Today's orders
    console.log('TEST 1: Today\'s Orders');
    const todayOrdersResult = await query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE created_at >= $1 AND created_at < $2`,
      [today, tomorrow]
    );
    console.log(`   Result: ${todayOrdersResult.rows[0].count} orders`);
    
    // Check total orders in database
    const totalOrdersResult = await query('SELECT COUNT(*) as count FROM orders');
    console.log(`   Total orders in DB: ${totalOrdersResult.rows[0].count}`);
    
    // Check most recent order
    const recentOrderResult = await query(
      'SELECT order_number, created_at FROM orders ORDER BY created_at DESC LIMIT 1'
    );
    if (recentOrderResult.rows.length > 0) {
      console.log(`   Most recent order: ${recentOrderResult.rows[0].order_number}`);
      console.log(`   Created at: ${recentOrderResult.rows[0].created_at}`);
    }

    // Test 2: Today's revenue
    console.log('\nTEST 2: Today\'s Revenue');
    const todayRevenueResult = await query(
      `SELECT 
        COALESCE(SUM(amount_paid), 0) as order_revenue
       FROM orders 
       WHERE created_at >= $1 AND created_at < $2`,
      [today, tomorrow]
    );
    console.log(`   Order revenue: UGX ${parseFloat(todayRevenueResult.rows[0].order_revenue).toLocaleString()}`);

    const todayDeliveryRevenueResult = await query(
      `SELECT 
        COALESCE(SUM(payment_amount), 0) as delivery_revenue
       FROM deliveries 
       WHERE payment_date >= $1 AND payment_date < $2 
       AND payment_status = 'PAID'`,
      [today, tomorrow]
    );
    console.log(`   Delivery revenue: UGX ${parseFloat(todayDeliveryRevenueResult.rows[0].delivery_revenue).toLocaleString()}`);
    
    const totalRevenue = 
      parseFloat(todayRevenueResult.rows[0].order_revenue) + 
      parseFloat(todayDeliveryRevenueResult.rows[0].delivery_revenue);
    console.log(`   TOTAL: UGX ${totalRevenue.toLocaleString()}`);

    // Test 3: Active customers
    console.log('\nTEST 3: Active Customers');
    const activeCustomersResult = await query('SELECT COUNT(*) as count FROM customers');
    console.log(`   Result: ${activeCustomersResult.rows[0].count} customers`);

    // Test 4: Average order value
    console.log('\nTEST 4: Average Order Value');
    const avgOrderValueResult = await query(
      'SELECT COALESCE(AVG(total_amount), 0) as avg_value FROM orders'
    );
    console.log(`   Result: UGX ${parseFloat(avgOrderValueResult.rows[0].avg_value).toLocaleString()}`);

    // Test 5: Order statuses
    console.log('\nTEST 5: Order Status Breakdown');
    const statusResult = await query(`
      SELECT 
        order_status,
        COUNT(*) as count
      FROM orders
      GROUP BY order_status
      ORDER BY count DESC
    `);
    
    statusResult.rows.forEach((row: any) => {
      console.log(`   ${row.order_status}: ${row.count} orders`);
    });

    // Test 6: Today's payments
    console.log('\nTEST 6: Today\'s Payment Transactions');
    const todayPaymentsResult = await query(
      `SELECT COUNT(*) as count FROM payments 
       WHERE DATE(payment_date) >= $1 AND DATE(payment_date) < $2`,
      [today, tomorrow]
    );
    console.log(`   Result: ${todayPaymentsResult.rows[0].count} transactions`);
    
    // Check if payments table exists and has data
    const totalPaymentsResult = await query('SELECT COUNT(*) as count FROM payments');
    console.log(`   Total payments in DB: ${totalPaymentsResult.rows[0].count}`);

    console.log('\n' + '═'.repeat(80));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(80) + '\n');
    
    const summary = {
      todayOrders: parseInt(todayOrdersResult.rows[0].count),
      todayRevenue: totalRevenue,
      activeCustomers: parseInt(activeCustomersResult.rows[0].count),
      averageOrderValue: parseFloat(avgOrderValueResult.rows[0].avg_value),
      pendingOrders: statusResult.rows.find((r: any) => r.order_status === 'RECEIVED')?.count || 0,
      processingOrders: statusResult.rows.find((r: any) => r.order_status === 'PROCESSING')?.count || 0,
      readyOrders: statusResult.rows.find((r: any) => r.order_status === 'READY')?.count || 0,
      todayPayments: parseInt(todayPaymentsResult.rows[0].count),
    };

    console.log('Dashboard Stats Object:');
    console.log(JSON.stringify(summary, null, 2));
    
    if (summary.todayOrders === 0) {
      console.log('\n⚠️  WARNING: No orders found for today!');
      console.log('   Possible reasons:');
      console.log('   1. No orders created today');
      console.log('   2. Server timezone mismatch');
      console.log('   3. Database date format issue\n');
      
      // Check server timezone
      console.log('🕐 Server Timezone Check:');
      const timezoneResult = await query('SHOW timezone');
      console.log(`   PostgreSQL timezone: ${timezoneResult.rows[0].TimeZone}`);
      console.log(`   Node.js Date.now(): ${new Date().toISOString()}`);
      console.log(`   Node.js TZ offset: ${new Date().getTimezoneOffset()} minutes\n`);
    }

    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testDashboardStats();
