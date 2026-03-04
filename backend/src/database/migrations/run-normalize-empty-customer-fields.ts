import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../../config/database';

async function normalizeEmptyCustomerFields() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔧 NORMALIZING EMPTY CUSTOMER FIELDS');
    console.log('═'.repeat(80) + '\n');

    // Convert empty strings to NULL for email
    console.log('Converting empty email strings to NULL...');
    const emailResult = await query(`
      UPDATE customers 
      SET email = NULL 
      WHERE email = ''
      RETURNING id, customer_id, name
    `);
    console.log(`✅ Updated ${emailResult.rowCount} customers with empty emails\n`);

    // Convert empty strings to NULL for location
    console.log('Converting empty location strings to NULL...');
    const locationResult = await query(`
      UPDATE customers 
      SET location = NULL 
      WHERE location = ''
      RETURNING id, customer_id, name
    `);
    console.log(`✅ Updated ${locationResult.rowCount} customers with empty locations\n`);

    // Convert empty strings to NULL for notes
    console.log('Converting empty notes strings to NULL...');
    const notesResult = await query(`
      UPDATE customers 
      SET notes = NULL 
      WHERE notes = ''
      RETURNING id, customer_id, name
    `);
    console.log(`✅ Updated ${notesResult.rowCount} customers with empty notes\n`);

    // Verify the changes
    console.log('Verifying changes...');
    const verifyResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE email IS NULL) as null_emails,
        COUNT(*) FILTER (WHERE email = '') as empty_emails,
        COUNT(*) FILTER (WHERE location IS NULL) as null_locations,
        COUNT(*) FILTER (WHERE location = '') as empty_locations,
        COUNT(*) FILTER (WHERE notes IS NULL) as null_notes,
        COUNT(*) FILTER (WHERE notes = '') as empty_notes
      FROM customers
    `);

    const stats = verifyResult.rows[0];
    console.log('Database statistics:');
    console.log(`  Emails: ${stats.null_emails} NULL, ${stats.empty_emails} empty strings`);
    console.log(`  Locations: ${stats.null_locations} NULL, ${stats.empty_locations} empty strings`);
    console.log(`  Notes: ${stats.null_notes} NULL, ${stats.empty_notes} empty strings\n`);

    console.log('═'.repeat(80));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
normalizeEmptyCustomerFields();
