import { query } from '../config/database';

async function checkUsersColumns() {
  try {
    console.log('Checking users table columns...');
    const result = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('users columns:', result.rows.map(r => r.column_name).join(', '));

    console.log('\nChecking user_role enum values...');
    const enumResult = await query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'user_role'::regtype 
      ORDER BY enumsortorder
    `);
    console.log('user_role values:', enumResult.rows.map(r => r.enumlabel).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsersColumns();
