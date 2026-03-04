import pool from '../config/database';

async function addSampleDeliveries() {
  const client = await pool.connect();

  try {
    console.log('✅ Database connected successfully\n');
    
    console.log('📦 Adding realistic sample deliveries...\n');
    
    // Get some existing orders
    const ordersResult = await client.query(`
      SELECT o.id, o.order_number, o.order_status
      FROM orders o
      WHERE o.order_status IN ('READY', 'DELIVERED')
      LIMIT 15
    `);
    
    if (ordersResult.rows.length === 0) {
      console.log('❌ No orders found. Please create some orders first.');
      return;
    }
    
    console.log(`✅ Found ${ordersResult.rows.length} orders to create deliveries for\n`);
    
    // Get delivery zones
    const zonesResult = await client.query('SELECT id, zone_name, base_delivery_cost FROM delivery_zones WHERE is_active = TRUE');
    const zones = zonesResult.rows;
    
    // Get delivery drivers
    const driversResult = await client.query('SELECT id FROM delivery_drivers WHERE is_active = TRUE');
    const drivers = driversResult.rows;
    
    const deliveryTypes = ['PICKUP', 'DELIVERY'];
    const timeSlots = ['MORNING (8AM-12PM)', 'AFTERNOON (12PM-4PM)', 'EVENING (4PM-8PM)'];
    const statuses = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'DELIVERED', 'DELIVERED']; // More delivered for realism
    
    let deliveredCount = 0;
    let inTransitCount = 0;
    let assignedCount = 0;
    let pendingCount = 0;
    
    for (const order of ordersResult.rows) {
      const deliveryType = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)];
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random date within last 7 days or next 3 days
      const daysOffset = Math.floor(Math.random() * 10) - 7; // -7 to +3
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + daysOffset);
      
      let delivery_zone_id = null;
      let delivery_cost = 0;
      let delivery_address = null;
      let driver_id = null;
      let assigned_at = null;
      let picked_up_at = null;
      let delivered_at = null;
      
      if (deliveryType === 'DELIVERY') {
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        delivery_zone_id = randomZone.id;
        delivery_cost = randomZone.base_delivery_cost;
        delivery_address = `Apartment ${Math.floor(Math.random() * 50) + 1}, ${randomZone.zone_name}`;
      }
      
      // Assign driver if not pending
      if (status !== 'PENDING') {
        const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
        driver_id = randomDriver.id;
        assigned_at = new Date(scheduledDate);
        assigned_at.setHours(6, 0, 0, 0); // 6 AM
      }
      
      // Set picked up time if in transit or delivered
      if (status === 'IN_TRANSIT' || status === 'DELIVERED') {
        picked_up_at = new Date(scheduledDate);
        const hour = timeSlot.includes('MORNING') ? 9 : timeSlot.includes('AFTERNOON') ? 13 : 17;
        picked_up_at.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      }
      
      // Set delivered time if delivered
      if (status === 'DELIVERED') {
        delivered_at = new Date(picked_up_at || scheduledDate);
        delivered_at.setMinutes(delivered_at.getMinutes() + 30 + Math.floor(Math.random() * 60)); // 30-90 mins after pickup
      }
      
      // Insert delivery
      await client.query(`
        INSERT INTO deliveries (
          order_id, delivery_type, delivery_zone_id, delivery_address, delivery_cost,
          scheduled_date, scheduled_time_slot, driver_id, delivery_status,
          assigned_at, picked_up_at, delivered_at, delivery_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        order.id,
        deliveryType,
        delivery_zone_id,
        delivery_address,
        delivery_cost,
        scheduledDate.toISOString().split('T')[0],
        timeSlot,
        driver_id,
        status,
        assigned_at,
        picked_up_at,
        delivered_at,
        deliveryType === 'PICKUP' ? 'Customer will collect from shop' : null
      ]);
      
      // Count statuses
      if (status === 'DELIVERED') deliveredCount++;
      else if (status === 'IN_TRANSIT') inTransitCount++;
      else if (status === 'ASSIGNED') assignedCount++;
      else pendingCount++;
    }
    
    console.log('✅ Sample deliveries added successfully!\n');
    
    console.log('📊 Delivery Status Summary:');
    console.log(`   - Delivered: ${deliveredCount}`);
    console.log(`   - In Transit: ${inTransitCount}`);
    console.log(`   - Assigned: ${assignedCount}`);
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   TOTAL: ${ordersResult.rows.length} deliveries\n`);
    
    // Calculate total revenue
    const revenueResult = await client.query(`
      SELECT SUM(delivery_cost) as total_revenue
      FROM deliveries
      WHERE delivery_type = 'DELIVERY' AND delivery_status = 'DELIVERED'
    `);
    
    console.log('💰 Delivery Revenue Summary:');
    console.log(`   - Total Delivery Revenue: UGX ${parseFloat(revenueResult.rows[0].total_revenue || 0).toLocaleString()}`);
    console.log('');
    
    console.log('✅ Sample data migration completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error adding sample deliveries:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addSampleDeliveries().catch(console.error);
