import { query } from '../config/database';

async function checkPriceTable() {
  try {
    // Check all tables that might be related to pricing
    const tablesQuery = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%price%'
      OR table_name LIKE '%service%'
      ORDER BY table_name
    `);

    console.log('\n📊 Tables related to pricing/services:');
    console.log('═'.repeat(50));
    
    if (tablesQuery.rows.length > 0) {
      tablesQuery.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    } else {
      console.log('   ⚠️  No price/service tables found');
    }

    // Also check the deliveries table
    const deliveriesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'deliveries'
    `);

    console.log('\n📦 Deliveries table:');
    if (deliveriesCheck.rows.length > 0) {
      console.log('   ✅ deliveries table exists');
    } else {
      console.log('   ❌ deliveries table not found');
    }

    // Check for delivery-related tables
    const deliveryTables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%deliver%'
      ORDER BY table_name
    `);

    console.log('\n🚚 All delivery-related tables:');
    deliveryTables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPriceTable();
