require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function showCustomerPaymentSearch() {
  try {
    console.log('🔍 SEARCHING PAYMENTS BY CUSTOMER NAME: "Christine"\n');
    console.log('=' .repeat(100));

    const result = await pool.query(`
      SELECT 
        o.order_number,
        c.name as customer_name,
        c.phone as customer_phone,
        TO_CHAR(o.created_at, 'YYYY-MM-DD') as payment_date,
        o.payment_method,
        o.amount_paid,
        o.payment_status,
        o.transaction_reference,
        o.balance,
        o.total_amount
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.amount_paid > 0 
        AND c.name ILIKE '%Christine%'
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    console.log(`\nFound ${result.rowCount} payments for customers with "Christine" in name:\n`);

    // Display like the table in the UI
    console.log('┌────────────┬─────────────┬───────────────────────┬──────────────────┬────────────────┬──────────┬──────────────────┐');
    console.log('│ Date       │ Order #     │ Customer              │ Method           │ Amount Paid    │ Status   │ Reference        │');
    console.log('├────────────┼─────────────┼───────────────────────┼──────────────────┼────────────────┼──────────┼──────────────────┤');

    result.rows.forEach(row => {
      const date = row.payment_date.padEnd(10);
      const orderNum = row.order_number.padEnd(11);
      const customer = row.customer_name.substring(0, 20).padEnd(21);
      
      let method = '';
      if (row.payment_method === 'CASH') method = 'Cash';
      else if (row.payment_method === 'MOBILE_MONEY_MTN') method = 'MTN Mobile';
      else if (row.payment_method === 'MOBILE_MONEY_AIRTEL') method = 'Airtel Money';
      else if (row.payment_method === 'BANK_TRANSFER') method = 'Bank Transfer';
      else if (row.payment_method === 'ON_ACCOUNT') method = 'On Account';
      method = method.padEnd(16);
      
      const amount = `UGX ${parseInt(row.amount_paid).toLocaleString()}`.padEnd(14);
      const status = row.payment_status.padEnd(8);
      const ref = (row.transaction_reference || '-').substring(0, 16).padEnd(16);
      
      console.log(`│ ${date} │ ${orderNum} │ ${customer} │ ${method} │ ${amount} │ ${status} │ ${ref} │`);
    });

    console.log('└────────────┴─────────────┴───────────────────────┴──────────────────┴────────────────┴──────────┴──────────────────┘');

    // Summary for this customer
    const summary = await pool.query(`
      SELECT 
        c.name as customer_name,
        COUNT(*) as total_payments,
        SUM(o.amount_paid) as total_paid,
        COUNT(CASE WHEN o.payment_method = 'CASH' THEN 1 END) as cash_payments,
        COUNT(CASE WHEN o.payment_method LIKE '%MTN%' THEN 1 END) as mtn_payments,
        COUNT(CASE WHEN o.payment_method LIKE '%AIRTEL%' THEN 1 END) as airtel_payments,
        COUNT(CASE WHEN o.payment_method = 'BANK_TRANSFER' THEN 1 END) as bank_payments
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.amount_paid > 0 
        AND c.name ILIKE '%Christine%'
      GROUP BY c.name
    `);

    console.log('\n📊 PAYMENT SUMMARY FOR THESE CUSTOMERS:\n');
    summary.rows.forEach(row => {
      console.log(`Customer: ${row.customer_name}`);
      console.log(`  Total Payments: ${row.total_payments}`);
      console.log(`  Total Amount: UGX ${parseInt(row.total_paid).toLocaleString()}`);
      console.log(`  Payment Methods:`);
      console.log(`    - Cash: ${row.cash_payments} payments`);
      console.log(`    - MTN Mobile Money: ${row.mtn_payments} payments`);
      console.log(`    - Airtel Money: ${row.airtel_payments} payments`);
      console.log(`    - Bank Transfer: ${row.bank_payments} payments`);
      console.log('');
    });

    console.log('=' .repeat(100));
    console.log('\n✨ This is EXACTLY what shows in the Payments section when you search by customer name! ✨\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

showCustomerPaymentSearch();
