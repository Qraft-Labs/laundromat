const { query } = require('./dist/config/database');
const axios = require('axios');

(async () => {
  try {
    // Get a READY order
    const result = await query(
      `SELECT o.id, o.order_number, o.order_status, o.updated_at, 
              c.name as customer_name, c.phone as customer_phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.order_status = 'READY' 
       ORDER BY o.updated_at DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      console.log('❌ No READY orders found');
      process.exit(1);
    }

    const order = result.rows[0];
    console.log('\n=== Testing Order Ready Notification ===');
    console.log(`Order: ${order.order_number}`);
    console.log(`Customer: ${order.customer_name}`);
    console.log(`Phone: ${order.customer_phone}`);
    console.log(`\nSending status update request to backend...`);

    // Get auth token from somewhere or create a test
    const token = process.argv[2]; // Pass token as argument
    
    if (!token) {
      console.log('\n⚠️  Please run: node test_order_ready.js YOUR_AUTH_TOKEN');
      console.log('Get your token from localStorage in browser console: localStorage.getItem("lush_token")');
      process.exit(1);
    }

    // Try to update the order status (change to PENDING then back to READY)
    try {
      // First change to PENDING
      await axios.put(
        `http://localhost:5000/api/orders/${order.id}/status`,
        { status: 'PENDING' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Changed to PENDING');
      
      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Change back to READY (this should trigger notification)
      await axios.put(
        `http://localhost:5000/api/orders/${order.id}/status`,
        { status: 'READY' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Changed back to READY - Check backend logs for WhatsApp notification!');
      
    } catch (error) {
      console.error('❌ API Error:', error.response?.data || error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
