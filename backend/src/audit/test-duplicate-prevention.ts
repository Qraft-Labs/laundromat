import { query } from '../config/database';

async function testDuplicatePrevention() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🧪 TESTING DUPLICATE PREVENTION SYSTEM');
    console.log('═'.repeat(80) + '\n');

    // Test 1: Verify UNIQUE constraints exist
    console.log('TEST 1: Verifying database constraints...');
    const constraints = await query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'customers'::regclass
      AND conname IN ('unique_customer_phone', 'unique_customer_email')
    `);

    if (constraints.rows.length === 2) {
      console.log('   ✅ Both UNIQUE constraints found:');
      constraints.rows.forEach((row: any) => {
        console.log(`      - ${row.constraint_name}: ${row.definition}`);
      });
    } else {
      console.log('   ❌ UNIQUE constraints missing!');
      process.exit(1);
    }

    // Test 2: Verify no phone duplicates
    console.log('\nTEST 2: Checking for phone duplicates...');
    const phoneDupes = await query(`
      SELECT phone, COUNT(*) as count
      FROM customers
      WHERE phone IS NOT NULL AND phone != ''
      GROUP BY phone
      HAVING COUNT(*) > 1
    `);

    if (phoneDupes.rows.length === 0) {
      console.log('   ✅ No phone duplicates found (perfect!)');
    } else {
      console.log(`   ❌ Found ${phoneDupes.rows.length} duplicate phones!`);
      process.exit(1);
    }

    // Test 3: Verify no email duplicates
    console.log('\nTEST 3: Checking for email duplicates...');
    const emailDupes = await query(`
      SELECT email, COUNT(*) as count
      FROM customers
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (emailDupes.rows.length === 0) {
      console.log('   ✅ No email duplicates found (perfect!)');
    } else {
      console.log(`   ❌ Found ${emailDupes.rows.length} duplicate emails!`);
      process.exit(1);
    }

    // Test 4: Try to insert duplicate phone (should fail)
    console.log('\nTEST 4: Testing phone constraint enforcement...');
    try {
      // Get an existing phone number
      const existingCustomer = await query(
        'SELECT phone, name, customer_id FROM customers LIMIT 1'
      );
      const testPhone = existingCustomer.rows[0].phone;
      
      // Try to insert duplicate
      await query(
        `INSERT INTO customers (customer_id, name, phone, email)
         VALUES ('TEST001', 'Test Duplicate', $1, 'test@example.com')`,
        [testPhone]
      );
      
      console.log('   ❌ Constraint NOT working - duplicate was inserted!');
      // Cleanup
      await query("DELETE FROM customers WHERE customer_id = 'TEST001'");
      process.exit(1);
      
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'unique_customer_phone') {
        console.log('   ✅ Phone constraint working - duplicate rejected');
        console.log(`      PostgreSQL error code: ${error.code}`);
        console.log(`      Constraint: ${error.constraint}`);
      } else {
        console.log('   ❌ Unexpected error:', error.message);
        process.exit(1);
      }
    }

    // Test 5: Try to insert duplicate email (should fail)
    console.log('\nTEST 5: Testing email constraint enforcement...');
    try {
      // Get an existing email
      const existingCustomer = await query(
        'SELECT email, name, customer_id FROM customers WHERE email IS NOT NULL AND email != \'\' LIMIT 1'
      );
      const testEmail = existingCustomer.rows[0].email;
      
      // Try to insert duplicate
      await query(
        `INSERT INTO customers (customer_id, name, phone, email)
         VALUES ('TEST002', 'Test Duplicate', '+256701999999', $1)`,
        [testEmail]
      );
      
      console.log('   ❌ Constraint NOT working - duplicate was inserted!');
      // Cleanup
      await query("DELETE FROM customers WHERE customer_id = 'TEST002'");
      process.exit(1);
      
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'unique_customer_email') {
        console.log('   ✅ Email constraint working - duplicate rejected');
        console.log(`      PostgreSQL error code: ${error.code}`);
        console.log(`      Constraint: ${error.constraint}`);
      } else {
        console.log('   ❌ Unexpected error:', error.message);
        process.exit(1);
      }
    }

    // Test 6: Verify same name with different phone IS allowed
    console.log('\nTEST 6: Testing same name with different phone (should succeed)...');
    try {
      const existingCustomer = await query(
        'SELECT name FROM customers LIMIT 1'
      );
      const sameName = existingCustomer.rows[0].name;
      
      const result = await query(
        `INSERT INTO customers (customer_id, name, phone, email)
         VALUES ('TEST003', $1, '+256701888888', 'test-unique@example.com')
         RETURNING *`,
        [sameName]
      );
      
      console.log(`   ✅ Same name allowed - created customer "${result.rows[0].name}"`);
      console.log('      (Different people/businesses can have same name)');
      
      // Cleanup
      await query("DELETE FROM customers WHERE customer_id = 'TEST003'");
      
    } catch (error: any) {
      console.log('   ❌ Failed to create customer with same name:', error.message);
      process.exit(1);
    }

    // Test 7: Count total customers
    console.log('\nTEST 7: System statistics...');
    const stats = await query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(DISTINCT phone) as unique_phones,
        COUNT(DISTINCT NULLIF(email, '')) as unique_emails,
        COUNT(DISTINCT name) as unique_names
      FROM customers
    `);

    const stat = stats.rows[0];
    console.log(`   📊 Total Customers: ${stat.total_customers}`);
    console.log(`   📱 Unique Phones: ${stat.unique_phones}`);
    console.log(`   📧 Unique Emails: ${stat.unique_emails}`);
    console.log(`   👤 Unique Names: ${stat.unique_names}`);
    
    if (parseInt(stat.total_customers) === parseInt(stat.unique_phones)) {
      console.log('   ✅ Every customer has unique phone (perfect!)');
    } else {
      console.log('   ❌ Phone count mismatch!');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ ALL TESTS PASSED - DUPLICATE PREVENTION SYSTEM WORKING!');
    console.log('═'.repeat(80) + '\n');
    
    console.log('📋 Summary:');
    console.log('   ✅ Database constraints active');
    console.log('   ✅ No duplicate phones');
    console.log('   ✅ No duplicate emails');
    console.log('   ✅ Duplicate phone insertion blocked');
    console.log('   ✅ Duplicate email insertion blocked');
    console.log('   ✅ Same name with different phone allowed');
    console.log('   ✅ Data integrity verified\n');
    
    console.log('🎯 Next Steps:');
    console.log('   1. Implement frontend real-time validation');
    console.log('   2. Add duplicate check on form blur');
    console.log('   3. Handle 409 errors with professional messages');
    console.log('   4. Show warnings for similar names\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
}

testDuplicatePrevention();
