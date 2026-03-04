// Quick Pre-Demo Test - Run this before your presentation
// Usage: node pre-demo-test.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:8080';

// Test credentials
const ADMIN_CREDS = {
  email: 'admin@lushlaundry.com',
  password: 'Admin123!'
};

let authToken = '';

console.log('🎯 LUSH LAUNDRY PRE-DEMO TEST\n');
console.log('Testing all critical systems...\n');

async function testBackendHealth() {
  try {
    await axios.get(BASE_URL);
    console.log('✅ Backend API: RUNNING (port 5000)');
    return true;
  } catch (error) {
    console.log('❌ Backend API: NOT RESPONDING');
    console.log('   → Start backend: cd backend && npm run dev');
    return false;
  }
}

async function testFrontendHealth() {
  try {
    await axios.get(FRONTEND_URL);
    console.log('✅ Frontend: RUNNING (port 8080)');
    return true;
  } catch (error) {
    console.log('❌ Frontend: NOT RESPONDING');
    console.log('   → Start frontend: npm run dev');
    return false;
  }
}

async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDS);
    authToken = response.data.token;
    console.log('✅ Login: Admin credentials working');
    return true;
  } catch (error) {
    console.log('❌ Login: Failed to authenticate admin');
    return false;
  }
}

async function testOrders() {
  try {
    const response = await axios.get(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Orders: ${response.data.orders.length} orders in database`);
    return true;
  } catch (error) {
    console.log('❌ Orders: Failed to fetch orders');
    return false;
  }
}

async function testCustomers() {
  try {
    const response = await axios.get(`${BASE_URL}/api/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const count = Array.isArray(response.data) ? response.data.length : 0;
    console.log(`✅ Customers: ${count} customers in database`);
    return true;
  } catch (error) {
    console.log('❌ Customers: Failed to fetch customers');
    return false;
  }
}

async function testFinancialDashboard() {
  try {
    const response = await axios.get(`${BASE_URL}/api/financial/dashboard?period=month`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const { total_revenue, net_profit } = response.data.summary;
    console.log(`✅ Financial Dashboard: Revenue ${parseFloat(total_revenue).toLocaleString()} UGX, Profit ${parseFloat(net_profit).toLocaleString()} UGX`);
    return true;
  } catch (error) {
    console.log('❌ Financial Dashboard: Failed to fetch data');
    return false;
  }
}

async function testPayroll() {
  try {
    const response = await axios.get(`${BASE_URL}/api/payroll/employees`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Payroll: ${response.data.length} employees on payroll`);
    return true;
  } catch (error) {
    console.log('❌ Payroll: Failed to fetch employees');
    return false;
  }
}

async function testInventory() {
  try {
    const response = await axios.get(`${BASE_URL}/api/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const count = Array.isArray(response.data) ? response.data.length : 0;
    console.log(`✅ Inventory: ${count} supplies tracked`);
    return true;
  } catch (error) {
    console.log('❌ Inventory: Failed to fetch supplies');
    return false;
  }
}

async function testExpenses() {
  try {
    const response = await axios.get(`${BASE_URL}/api/expenses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Expenses: ${response.data.expenses.length} expense records`);
    return true;
  } catch (error) {
    console.log('❌ Expenses: Failed to fetch expenses');
    return false;
  }
}

async function runAllTests() {
  const results = [];
  
  // Test servers
  results.push(await testBackendHealth());
  results.push(await testFrontendHealth());
  
  console.log('');
  
  // Test authentication
  results.push(await testLogin());
  
  console.log('');
  
  // Test all features
  if (authToken) {
    results.push(await testOrders());
    results.push(await testCustomers());
    results.push(await testFinancialDashboard());
    results.push(await testPayroll());
    results.push(await testInventory());
    results.push(await testExpenses());
  }
  
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`\n🎉 ALL TESTS PASSED (${passed}/${total})`);
    console.log('\n✅ System ready for demo!');
    console.log('   Open: http://localhost:8080');
    console.log('   Login: admin@lushlaundry.com / Admin123!\n');
  } else {
    console.log(`\n⚠️  SOME TESTS FAILED (${passed}/${total} passed)`);
    console.log('\n   Fix issues above before demo.\n');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
