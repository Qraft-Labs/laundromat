import pool from '../config/database';

async function testRestoredSchema() {
  console.log('🔍 Testing Restored Schema...\n');

  try {
    // Test 1: Dashboard queries (should work - already tested)
    console.log('1️⃣ Testing Dashboard Queries...');
    const avgOrder = await pool.query('SELECT COALESCE(AVG(total), 0) as avg FROM orders');
    console.log(`✅ Average order value: UGX ${parseFloat(avgOrder.rows[0].avg).toFixed(2)}`);

    const pendingOrders = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    console.log(`✅ Pending orders: ${pendingOrders.rows[0].count}`);

    // Test 2: Inventory queries with new schema
    console.log('\n2️⃣ Testing Inventory Queries...');
    
    const inventoryItems = await pool.query(`
      SELECT item_name, quantity, reorder_level, unit_cost, category, supplier 
      FROM inventory_items 
      WHERE is_active = TRUE 
      LIMIT 5
    `);
    console.log(`✅ Found ${inventoryItems.rows.length} active inventory items`);
    console.table(inventoryItems.rows);

    // Test 3: Low stock check
    const lowStock = await pool.query(`
      SELECT item_name, quantity, reorder_level 
      FROM inventory_items 
      WHERE is_active = TRUE AND quantity <= reorder_level
    `);
    console.log(`\n3️⃣ Low Stock Items: ${lowStock.rows.length}`);
    if (lowStock.rows.length > 0) {
      console.table(lowStock.rows);
    }

    // Test 4: Orders table - check if total_amount and balance exist
    console.log('\n4️⃣ Checking Orders Table...');
    const orderCheck = await pool.query(`
      SELECT order_number, total, total_amount, balance, amount_paid 
      FROM orders 
      LIMIT 3
    `);
    console.log('✅ Orders with new columns:');
    console.table(orderCheck.rows);

    console.log('\n✅ ALL SCHEMA TESTS PASSED!');
    console.log('\n📊 Schema Status:');
    console.log('  ✅ Dashboard uses: total, status (lowercase)');
    console.log('  ✅ Inventory uses: item_name, quantity, reorder_level, unit_cost, category, supplier, is_active');
    console.log('  ✅ Orders have: total_amount, balance columns restored');
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testRestoredSchema();
