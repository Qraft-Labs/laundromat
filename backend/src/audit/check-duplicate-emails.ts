import { query } from '../config/database';

async function checkDuplicateEmails() {
  try {
    const duplicates = await query(`
      SELECT 
        email,
        COUNT(*) as count,
        ARRAY_AGG(id ORDER BY id) as customer_ids,
        ARRAY_AGG(name ORDER BY id) as customer_names,
        ARRAY_AGG(phone ORDER BY id) as phones
      FROM customers
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
      ORDER BY count DESC, email
    `);

    console.log('\n' + '═'.repeat(80));
    console.log(`📧 DUPLICATE EMAILS FOUND: ${duplicates.rows.length}`);
    console.log('═'.repeat(80) + '\n');

    duplicates.rows.forEach((row, index) => {
      console.log(`${index + 1}. Email: ${row.email} (${row.count} customers)`);
      console.log(`   IDs: ${row.customer_ids.join(', ')}`);
      console.log(`   Names: ${row.customer_names.join(', ')}`);
      console.log(`   Phones: ${row.phones.join(', ')}`);
      console.log('');
    });

    console.log('SOLUTION: Set empty emails for duplicates (keep first occurrence)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDuplicateEmails();
