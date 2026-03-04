import { query } from '../config/database';

async function addUserRoles() {
  try {
    console.log('Adding MANAGER and DESKTOP_AGENT to user_role enum...');
    
    // Add MANAGER role
    await query(`
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MANAGER'
    `);
    console.log('✅ Added MANAGER role');

    // Add DESKTOP_AGENT role
    await query(`
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'DESKTOP_AGENT'
    `);
    console.log('✅ Added DESKTOP_AGENT role');

    // Verify
    const result = await query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'user_role'::regtype 
      ORDER BY enumsortorder
    `);
    console.log('\n✅ Current user_role values:', result.rows.map(r => r.enumlabel).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addUserRoles();
