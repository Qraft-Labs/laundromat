import { query } from '../config/database';

async function checkUsersTable() {
  try {
    const columns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 USERS TABLE STRUCTURE:\n');
    columns.rows.forEach((col: any) => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    console.log('\n📋 SAMPLE USER DATA:\n');
    const sample = await query(`SELECT * FROM users LIMIT 1`);
    if (sample.rows.length > 0) {
      console.log('   Fields:', Object.keys(sample.rows[0]).join(', '));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsersTable();
