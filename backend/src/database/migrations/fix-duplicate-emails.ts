import { query } from '../../config/database';

async function fixDuplicateEmails() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔧 FIXING DUPLICATE EMAILS');
    console.log('═'.repeat(80) + '\n');

    // Strategy: For duplicate emails, keep first customer with that email,
    // and modify subsequent ones by adding branch number

    const duplicates = await query(`
      SELECT 
        email,
        ARRAY_AGG(id ORDER BY id) as customer_ids,
        ARRAY_AGG(name ORDER BY id) as customer_names
      FROM customers
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
      ORDER BY email
    `);

    console.log(`Found ${duplicates.rows.length} emails with duplicates\n`);

    for (const row of duplicates.rows) {
      const email = row.email;
      const ids = row.customer_ids;
      const names = row.customer_names;

      console.log(`Processing: ${email}`);
      console.log(`  Customers: ${ids.join(', ')}`);

      // Keep first customer with original email
      console.log(`  ✅ Keeping ID ${ids[0]} with ${email}`);

      // Update subsequent customers
      for (let i = 1; i < ids.length; i++) {
        const customerId = ids[i];
        
        // Create unique email by adding branch number
        const emailParts = email.split('@');
        const newEmail = `${emailParts[0]}-branch${i + 1}@${emailParts[1]}`;

        await query(
          'UPDATE customers SET email = $1 WHERE id = $2',
          [newEmail, customerId]
        );

        console.log(`  🔄 Updated ID ${customerId} to ${newEmail}`);
      }

      console.log('');
    }

    // Verify no more duplicates
    const remaining = await query(`
      SELECT COUNT(*) as count
      FROM customers
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    console.log('═'.repeat(80));
    if (remaining.rows.length === 0) {
      console.log('✅ ALL DUPLICATE EMAILS FIXED!');
      console.log('═'.repeat(80));
      console.log('\n📋 Changes made:');
      console.log('   - Elite Supermarket branches: info@..., info-branch2@..., info-branch3@...');
      console.log('   - Grace College branches: info@..., info-branch2@..., info-branch3@...');
      console.log('   - Other duplicates: Numbered as branch2, branch3, etc.');
      console.log('');
      console.log('✅ Now ready to add UNIQUE constraint on email!');
    } else {
      console.log('⚠️  Some duplicates remain');
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDuplicateEmails();
