import pool from '../config/database';

async function createRealisticDeliveries() {
  const client = await pool.connect();

  try {
    console.log('✅ Database connected successfully\n');
    
    console.log('📦 Creating realistic Ugandan delivery system...\n');
    
    // Read and execute the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'create-realistic-deliveries.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Delivery system created successfully!\n');
    
    // Verify data
    const zonesResult = await client.query('SELECT COUNT(*) FROM delivery_zones');
    const driversResult = await client.query('SELECT COUNT(*) FROM delivery_drivers');
    
    console.log('📊 Delivery System Summary:');
    console.log(`   - Delivery Zones: ${zonesResult.rows[0].count} zones (Kampala & surrounding areas)`);
    console.log(`   - Delivery Drivers: ${driversResult.rows[0].count} active drivers`);
    console.log(`   - Status Workflow: PENDING → ASSIGNED → IN_TRANSIT → DELIVERED/FAILED`);
    console.log('');
    
    // Show zones
    const zones = await client.query(`
      SELECT zone_name, zone_code, base_delivery_cost, estimated_delivery_time_minutes
      FROM delivery_zones
      ORDER BY base_delivery_cost ASC
    `);
    
    console.log('📍 Delivery Zones:');
    zones.rows.forEach((zone: any) => {
      console.log(`   - ${zone.zone_name} (${zone.zone_code}): UGX ${zone.base_delivery_cost.toLocaleString()} | ~${zone.estimated_delivery_time_minutes} mins`);
    });
    console.log('');
    
    // Show drivers
    const drivers = await client.query(`
      SELECT name, phone, vehicle_type, vehicle_number, total_deliveries, rating
      FROM delivery_drivers
      WHERE is_active = TRUE
      ORDER BY total_deliveries DESC
    `);
    
    console.log('🚗 Active Delivery Drivers:');
    drivers.rows.forEach((driver: any) => {
      console.log(`   - ${driver.name} | ${driver.phone} | ${driver.vehicle_type} (${driver.vehicle_number}) | ${driver.total_deliveries} deliveries | ⭐ ${driver.rating}`);
    });
    console.log('');
    
    console.log('✅ Realistic delivery system setup complete!\n');
    console.log('💡 Next steps:');
    console.log('   1. Initiate deliveries from ready orders');
    console.log('   2. Assign drivers to pending deliveries');
    console.log('   3. Track delivery status in real-time');
    console.log('   4. Collect customer feedback and ratings\n');
    
  } catch (error) {
    console.error('❌ Error creating delivery system:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createRealisticDeliveries().catch(console.error);
