const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testFinancialAPI() {
  try {
    // Generate admin token
    const token = jwt.sign(
      { id: 4, email: 'admin@lushlaundry.com', role: 'ADMIN' },
      'lush-laundry-super-secret-key-change-in-production'
    );

    console.log('📊 Testing Financial Dashboard API...\n');

    const response = await axios.get('http://localhost:5000/api/financial/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ API Response:\n');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFinancialAPI();
