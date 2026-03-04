import { query } from '../config/database';

async function checkDuplicates() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 DUPLICATE DETECTION AUDIT');
    console.log('═'.repeat(80) + '\n');

    // 1. Check duplicate customer names
    console.log('1️⃣  DUPLICATE CUSTOMER NAMES...\n');
    const duplicateNames = await query(`
      SELECT 
        LOWER(TRIM(name)) as normalized_name,
        COUNT(*) as count,
        ARRAY_AGG(name ORDER BY id) as original_names,
        ARRAY_AGG(id ORDER BY id) as customer_ids,
        ARRAY_AGG(phone ORDER BY id) as phone_numbers
      FROM customers
      GROUP BY LOWER(TRIM(name))
      HAVING COUNT(*) > 1
      ORDER BY count DESC, normalized_name
    `);

    if (duplicateNames.rows.length === 0) {
      console.log('   ✅ No duplicate customer names found!');
    } else {
      console.log(`   ⚠️  Found ${duplicateNames.rows.length} duplicate customer names:\n`);
      duplicateNames.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.original_names[0]}" (${row.count} times)`);
        console.log(`      IDs: ${row.customer_ids.join(', ')}`);
        console.log(`      Phones: ${row.phone_numbers.join(', ')}`);
        console.log('');
      });
    }

    // 2. Check duplicate phone numbers
    console.log('2️⃣  DUPLICATE PHONE NUMBERS...\n');
    const duplicatePhones = await query(`
      SELECT 
        phone,
        COUNT(*) as count,
        ARRAY_AGG(name ORDER BY id) as customer_names,
        ARRAY_AGG(id ORDER BY id) as customer_ids
      FROM customers
      WHERE phone IS NOT NULL AND phone != ''
      GROUP BY phone
      HAVING COUNT(*) > 1
      ORDER BY count DESC, phone
    `);

    if (duplicatePhones.rows.length === 0) {
      console.log('   ✅ No duplicate phone numbers found!');
    } else {
      console.log(`   ⚠️  Found ${duplicatePhones.rows.length} duplicate phone numbers:\n`);
      duplicatePhones.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.phone} (${row.count} customers)`);
        console.log(`      Names: ${row.customer_names.join(', ')}`);
        console.log(`      IDs: ${row.customer_ids.join(', ')}`);
        console.log('');
      });
    }

    // 3. Check duplicate staff/employee names
    console.log('3️⃣  DUPLICATE STAFF NAMES...\n');
    const duplicateStaff = await query(`
      SELECT 
        LOWER(TRIM(employee_name)) as normalized_name,
        COUNT(*) as count,
        ARRAY_AGG(employee_name ORDER BY id) as original_names,
        ARRAY_AGG(id ORDER BY id) as employee_ids,
        ARRAY_AGG(position ORDER BY id) as positions
      FROM payroll_employees
      GROUP BY LOWER(TRIM(employee_name))
      HAVING COUNT(*) > 1
      ORDER BY count DESC, normalized_name
    `);

    if (duplicateStaff.rows.length === 0) {
      console.log('   ✅ No duplicate staff names found!');
    } else {
      console.log(`   ⚠️  Found ${duplicateStaff.rows.length} duplicate staff names:\n`);
      duplicateStaff.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.original_names[0]}" (${row.count} times)`);
        console.log(`      IDs: ${row.employee_ids.join(', ')}`);
        console.log(`      Positions: ${row.positions.join(', ')}`);
        console.log('');
      });
    }

    // 4. Check duplicate user emails
    console.log('4️⃣  DUPLICATE USER EMAILS...\n');
    const duplicateEmails = await query(`
      SELECT 
        LOWER(email) as normalized_email,
        COUNT(*) as count,
        ARRAY_AGG(email ORDER BY id) as emails,
        ARRAY_AGG(id ORDER BY id) as user_ids,
        ARRAY_AGG(role ORDER BY id) as roles
      FROM users
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1
      ORDER BY count DESC, normalized_email
    `);

    if (duplicateEmails.rows.length === 0) {
      console.log('   ✅ No duplicate user emails found!');
    } else {
      console.log(`   ⚠️  Found ${duplicateEmails.rows.length} duplicate user emails:\n`);
      duplicateEmails.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.emails[0]} (${row.count} users)`);
        console.log(`      IDs: ${row.user_ids.join(', ')}`);
        console.log(`      Roles: ${row.roles.join(', ')}`);
        console.log('');
      });
    }

    // 5. Summary
    console.log('═'.repeat(80));
    console.log('📊 DUPLICATE SUMMARY');
    console.log('═'.repeat(80));
    console.log(`   Customer Names:  ${duplicateNames.rows.length > 0 ? '⚠️  ' + duplicateNames.rows.length + ' duplicates' : '✅ No duplicates'}`);
    console.log(`   Phone Numbers:   ${duplicatePhones.rows.length > 0 ? '⚠️  ' + duplicatePhones.rows.length + ' duplicates' : '✅ No duplicates'}`);
    console.log(`   Staff Names:     ${duplicateStaff.rows.length > 0 ? '⚠️  ' + duplicateStaff.rows.length + ' duplicates' : '✅ No duplicates'}`);
    console.log(`   User Emails:     ${duplicateEmails.rows.length > 0 ? '⚠️  ' + duplicateEmails.rows.length + ' duplicates' : '✅ No duplicates'}`);
    console.log('');

    if (duplicatePhones.rows.length > 0) {
      console.log('⚠️  WARNING: Duplicate phone numbers are problematic!');
      console.log('   Same phone number should not belong to different customers.');
      console.log('   This may cause confusion when searching or sending SMS.');
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    process.exit(1);
  }
}

checkDuplicates();
