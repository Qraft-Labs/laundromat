import { query } from '../config/database';

async function checkEnums() {
  try {
    // Check role enum
    const roleEnum = await query(`
      SELECT unnest(enum_range(NULL::user_role))::text as role
    `);
    console.log('\n📋 USER_ROLE ENUM VALUES:');
    roleEnum.rows.forEach((r: any) => console.log(`   - ${r.role}`));

    // Check status enum
    const statusEnum = await query(`
      SELECT unnest(enum_range(NULL::user_status))::text as status
    `);
    console.log('\n📋 USER_STATUS ENUM VALUES:');
    statusEnum.rows.forEach((r: any) => console.log(`   - ${r.status}`));

    // Check actual user data
    const userSample = await query(`
      SELECT role, status, COUNT(*) as count
      FROM users
      GROUP BY role, status
    `);
    console.log('\n📋 ACTUAL USER DATA:');
    userSample.rows.forEach((r: any) => {
      console.log(`   ${r.role} - ${r.status}: ${r.count} users`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEnums();
