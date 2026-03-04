import { query } from './src/config/database';

async function checkDeliveries() {
  try {
    // Check deliveries table structure
    const tableInfo = await query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'deliveries'
       ORDER BY ordinal_position`
    );
    
    console.log('\n===== DELIVERIES TABLE STRUCTURE =====');
    tableInfo.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });
    
    // Check recent deliveries (last 7 days)
    const recentDeliveries = await query(
      `SELECT 
        d.id,
        d.order_id,
        o.order_number,
        c.name as customer_name,
        d.delivery_type,
        d.delivery_status,
        d.delivery_revenue,
        d.scheduled_date,
        d.delivered_at,
        d.created_at,
        d.updated_at
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       JOIN customers c ON o.customer_id = c.id
       WHERE d.created_at >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY d.created_at DESC
       LIMIT 20`
    );
    
    console.log('\n===== DELIVERIES (Last 7 Days) =====');
    recentDeliveries.rows.forEach(d => {
      console.log(`
ID: ${d.id}
Order: ${d.order_number}
Customer: ${d.customer_name}
Type: ${d.delivery_type}
Status: ${d.delivery_status}
Revenue: ${d.delivery_revenue || 0}
Scheduled: ${d.scheduled_date}
Delivered: ${d.delivered_at || 'Not yet'}
Created: ${d.created_at}
---`);
    });
    
    // Count by day
    const dailyCount = await query(
      `SELECT 
        DATE(created_at) as delivery_date,
        COUNT(*) as count,
        SUM(CASE WHEN delivery_status = 'DELIVERED' THEN 1 ELSE 0 END) as completed
       FROM deliveries
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY delivery_date DESC`
    );
    
    console.log('\n===== DAILY DELIVERY COUNTS (Last 7 Days) =====');
    dailyCount.rows.forEach(row => {
      console.log(`${row.delivery_date}: ${row.completed}/${row.count} completed`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDeliveries();
