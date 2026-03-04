import { query } from '../config/database';

async function checkDeliverySystem() {
  console.log('\n' + '═'.repeat(70));
  console.log('🚚 DELIVERY SYSTEM ANALYSIS');
  console.log('═'.repeat(70) + '\n');

  try {
    // 1. Check if delivery_drivers table exists and its structure
    console.log('📋 1. DELIVERY_DRIVERS TABLE STRUCTURE\n');
    
    const tableCheck = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'delivery_drivers'
      ORDER BY ordinal_position
    `);

    if (tableCheck.rows.length > 0) {
      console.log('   ✅ delivery_drivers table EXISTS\n');
      console.log('   Columns:');
      tableCheck.rows.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
      });
      
      // Check if there's data
      const countQuery = await query('SELECT COUNT(*) as count FROM delivery_drivers');
      console.log(`\n   Total records: ${countQuery.rows[0].count}`);
      
      if (parseInt(countQuery.rows[0].count) > 0) {
        const sampleData = await query('SELECT * FROM delivery_drivers LIMIT 3');
        console.log('\n   Sample data:');
        sampleData.rows.forEach((row, i) => {
          console.log(`      ${i + 1}. ${JSON.stringify(row, null, 2)}`);
        });
      }
    } else {
      console.log('   ❌ delivery_drivers table DOES NOT EXIST');
    }

    // 2. Check deliveries table structure
    console.log('\n' + '═'.repeat(70));
    console.log('📋 2. DELIVERIES TABLE STRUCTURE\n');
    
    const deliveriesStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'deliveries'
      ORDER BY ordinal_position
    `);

    console.log('   Columns:');
    deliveriesStructure.rows.forEach(col => {
      console.log(`      - ${col.column_name}: ${col.data_type}`);
    });

    // 3. Check how delivery personnel info is stored
    console.log('\n' + '═'.repeat(70));
    console.log('📋 3. DELIVERY PERSONNEL INFORMATION\n');

    const deliveriesData = await query(`
      SELECT id, scheduled_date, scheduled_time_slot, delivery_status, 
             driver_id, delivery_person_name, vehicle_info
      FROM deliveries 
      LIMIT 5
    `);

    if (deliveriesData.rows.length > 0) {
      console.log('   Sample delivery records:');
      deliveriesData.rows.forEach((row, i) => {
        console.log(`\n      Delivery ${i + 1}:`);
        console.log(`         ID: ${row.id}`);
        console.log(`         Date: ${row.scheduled_date}`);
        console.log(`         Time Slot: ${row.scheduled_time_slot || 'NULL'}`);
        console.log(`         Status: ${row.delivery_status}`);
        console.log(`         Driver ID (FK): ${row.driver_id || 'NULL'}`);
        console.log(`         Person Name: ${row.delivery_person_name || 'NULL'}`);
        console.log(`         Vehicle Info: ${row.vehicle_info || 'NULL'}`);
      });
    } else {
      console.log('   ⚠️  No delivery records found');
    }

    // 4. Check delivery zones
    console.log('\n' + '═'.repeat(70));
    console.log('📋 4. DELIVERY ZONES\n');

    const zonesCount = await query('SELECT COUNT(*) as count FROM delivery_zones');
    console.log(`   Total zones: ${zonesCount.rows[0].count}`);

    if (parseInt(zonesCount.rows[0].count) > 0) {
      const zones = await query('SELECT * FROM delivery_zones LIMIT 5');
      console.log('\n   Sample zones:');
      zones.rows.forEach(zone => {
        console.log(`      - ${zone.name || zone.zone_name}: ${zone.delivery_fee || zone.fee}`);
      });
    }

    // 5. Summary and recommendations
    console.log('\n' + '═'.repeat(70));
    console.log('📊 SUMMARY & RECOMMENDATIONS\n');

    console.log('   Current Setup:');
    console.log('      - Deliveries table: ✅ Active');
    console.log(`      - Delivery drivers table: ${tableCheck.rows.length > 0 ? '✅ Exists' : '❌ Not found'}`);
    console.log('      - Delivery zones: ✅ Active');
    
    console.log('\n   Business Reality:');
    console.log('      ❗ Use external/freelance delivery personnel');
    console.log('      ❗ Personnel change frequently (not employed staff)');
    console.log('      ❗ Could be drivers OR riders (motorcycles/bikes)');
    console.log('      ❗ Need flexible system for random/changing personnel');

    console.log('\n   Recommendations:');
    if (tableCheck.rows.length > 0) {
      console.log('      1. Rename "delivery_drivers" → "delivery_personnel"');
      console.log('      2. Add "personnel_type" field (DRIVER/RIDER/COURIER)');
      console.log('      3. Add "service_provider" field (e.g., "Uber", "Bolt", "Freelance")');
      console.log('      4. Make it clear these are NOT employees');
      console.log('      5. Allow ad-hoc entries (quick add for one-time riders)');
    } else {
      console.log('      1. Delivery personnel info stored directly in deliveries table');
      console.log('      2. This is GOOD for freelance/changing personnel');
      console.log('      3. No need for separate personnel table');
      console.log('      4. Consider adding "personnel_type" (DRIVER/RIDER)');
      console.log('      5. Consider adding "service_provider" field');
    }

    console.log('\n' + '═'.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDeliverySystem();
