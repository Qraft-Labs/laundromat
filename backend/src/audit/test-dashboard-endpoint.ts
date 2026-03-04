import pool from '../config/database';

async function testDashboardQueries() {
  console.log('🔍 Testing Dashboard Queries...\n');

  try {
    // Test 1: Today's orders count
    console.log('1️⃣ Testing today\'s orders...');
    const todayOrdersResult = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    console.log('✅ Today\'s orders:', todayOrdersResult.rows[0].count);

    // Test 2: Today's revenue
    console.log('\n2️⃣ Testing today\'s revenue...');
    const todayRevenueResult = await pool.query(
      `SELECT 
        COALESCE(SUM(amount_paid), 0) as order_revenue
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE`
    );
    console.log('✅ Today\'s order revenue:', todayRevenueResult.rows[0].order_revenue);

    // Test 3: Today's delivery revenue
    console.log('\n3️⃣ Testing today\'s delivery revenue...');
    const todayDeliveryRevenueResult = await pool.query(
      `SELECT 
        COALESCE(SUM(payment_amount), 0) as delivery_revenue
       FROM deliveries 
       WHERE DATE(payment_date) = CURRENT_DATE 
       AND payment_status = 'PAID'`
    );
    console.log('✅ Today\'s delivery revenue:', todayDeliveryRevenueResult.rows[0].delivery_revenue);

    // Test 4: Active customers
    console.log('\n4️⃣ Testing active customers...');
    const activeCustomersResult = await pool.query(
      `SELECT COUNT(*) as count FROM customers`
    );
    console.log('✅ Active customers:', activeCustomersResult.rows[0].count);

    // Test 5: Average order value
    console.log('\n5️⃣ Testing average order value...');
    const avgOrderValueResult = await pool.query(
      `SELECT COALESCE(AVG(total), 0) as avg_value FROM orders`
    );
    console.log('✅ Average order value:', avgOrderValueResult.rows[0].avg_value);

    // Test 6: Pending orders
    console.log('\n6️⃣ Testing pending orders...');
    const pendingOrdersResult = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE status = 'pending'`
    );
    console.log('✅ Pending orders:', pendingOrdersResult.rows[0].count);

    // Test 7: Processing orders
    console.log('\n7️⃣ Testing processing orders...');
    const processingOrdersResult = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE status = 'processing'`
    );
    console.log('✅ Processing orders:', processingOrdersResult.rows[0].count);

    // Test 8: Ready orders
    console.log('\n8️⃣ Testing ready orders...');
    const readyOrdersResult = await pool.query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE status = 'ready'`
    );
    console.log('✅ Ready orders:', readyOrdersResult.rows[0].count);

    // Test 9: Today's payments
    console.log('\n9️⃣ Testing today\'s payments...');
    const todayPaymentsResult = await pool.query(
      `SELECT COUNT(*) as count FROM payments 
       WHERE DATE(payment_date) = CURRENT_DATE`
    );
    console.log('✅ Today\'s payments:', todayPaymentsResult.rows[0].count);

    // Test 10: Pending users
    console.log('\n🔟 Testing pending users...');
    const pendingUsersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE status = 'PENDING'`
    );
    console.log('✅ Pending users:', pendingUsersResult.rows[0].count);

    console.log('\n✅ ALL QUERIES PASSED!');
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testDashboardQueries();
