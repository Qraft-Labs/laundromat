const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@lushlaundry.com',
        password: 'Admin123!'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('Token:', data.token.substring(0, 20) + '...');
      console.log('User:', data.user.full_name);
      console.log('Role:', data.user.role);
    } else {
      console.log('❌ LOGIN FAILED:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
