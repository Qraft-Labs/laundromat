import axios from 'axios';

async function testDashboardAPI() {
  console.log('🔍 Testing Dashboard API Endpoint...\n');

  try {
    // You'll need a valid token - replace this with an actual token from login
    const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });

    console.log('✅ SUCCESS! Dashboard data:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('❌ SERVER ERROR:', error.response.status);
      console.error('Error message:', error.response.data);
      console.error('\nFull response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('❌ NO RESPONSE from server');
      console.error('Is the server running on http://localhost:5000?');
    } else {
      console.error('❌ REQUEST ERROR:', error.message);
    }
  }
}

testDashboardAPI();
