import { query } from '../../config/database';

async function addCustomerUniqueConstraints() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔒 ADDING UNIQUE CONSTRAINTS TO CUSTOMERS TABLE');
    console.log('═'.repeat(80) + '\n');

    // Step 1: Check for existing duplicates
    console.log('STEP 1: Checking for duplicate phone numbers...');
    const duplicatePhones = await query(`
      SELECT phone, COUNT(*) as count
      FROM customers
      WHERE phone IS NOT NULL AND phone != ''
      GROUP BY phone
      HAVING COUNT(*) > 1
    `);

    if (duplicatePhones.rows.length > 0) {
      console.log(`   ❌ Found ${duplicatePhones.rows.length} duplicate phone numbers!`);
      console.log('   Cannot add UNIQUE constraint. Clean data first.');
      process.exit(1);
    }
    console.log('   ✅ No duplicate phone numbers found\n');

    console.log('STEP 2: Checking for duplicate emails...');
    const duplicateEmails = await query(`
      SELECT email, COUNT(*) as count
      FROM customers
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicateEmails.rows.length > 0) {
      console.log(`   ❌ Found ${duplicateEmails.rows.length} duplicate emails!`);
      console.log('   Cannot add UNIQUE constraint. Clean data first.');
      process.exit(1);
    }
    console.log('   ✅ No duplicate emails found\n');

    // Step 2: Add UNIQUE constraint on phone
    console.log('STEP 3: Adding UNIQUE constraint on phone number...');
    await query(`
      ALTER TABLE customers 
      ADD CONSTRAINT unique_customer_phone 
      UNIQUE (phone)
    `);
    console.log('   ✅ Constraint added: unique_customer_phone\n');

    // Step 3: Add UNIQUE constraint on email
    console.log('STEP 4: Adding UNIQUE constraint on email...');
    await query(`
      ALTER TABLE customers 
      ADD CONSTRAINT unique_customer_email 
      UNIQUE (email)
    `);
    console.log('   ✅ Constraint added: unique_customer_email\n');

    // Step 4: Verify constraints
    console.log('STEP 5: Verifying constraints...');
    const constraints = await query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'customers'::regclass
      AND conname IN ('unique_customer_phone', 'unique_customer_email')
    `);

    console.log('   Constraints added:');
    constraints.rows.forEach(row => {
      console.log(`   - ${row.constraint_name}: ${row.constraint_definition}`);
    });
    console.log('');

    console.log('═'.repeat(80));
    console.log('✅ UNIQUE CONSTRAINTS ADDED SUCCESSFULLY');
    console.log('═'.repeat(80));
    console.log('');
    console.log('📋 What this means:');
    console.log('   ✅ Cannot add two customers with same phone number');
    console.log('   ✅ Cannot add two customers with same email');
    console.log('   ✅ Database will reject duplicates automatically');
    console.log('   ✅ Backend will catch errors and show helpful messages');
    console.log('');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error adding constraints:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Constraints already exist. No action needed.');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

addCustomerUniqueConstraints();
