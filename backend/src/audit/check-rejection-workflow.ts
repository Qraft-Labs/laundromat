import { query } from '../config/database';

async function checkRejectionWorkflow() {
  console.log('\n🔍 CHECKING USER REJECTION WORKFLOW\n');
  console.log('═'.repeat(70) + '\n');

  try {
    // Check enum values
    const enumCheck = await query(`
      SELECT unnest(enum_range(NULL::user_status)) as status
    `);

    console.log('📋 USER_STATUS ENUM VALUES:');
    enumCheck.rows.forEach((row: any) => {
      console.log(`   - ${row.status}`);
    });

    // Check if REJECTED status exists
    const hasRejected = enumCheck.rows.some((r: any) => r.status === 'REJECTED');
    
    if (hasRejected) {
      console.log('\n✅ REJECTED status exists in enum\n');
      
      // Check for rejected users
      const rejectedUsers = await query(`
        SELECT id, email, full_name, role, status, created_at
        FROM users
        WHERE status = 'REJECTED'
        ORDER BY created_at DESC
      `);

      if (rejectedUsers.rows.length > 0) {
        console.log(`📊 REJECTED USERS: ${rejectedUsers.rows.length} found\n`);
        rejectedUsers.rows.forEach((user: any) => {
          console.log(`   ${user.email} (${user.role}) - Created: ${user.created_at}`);
        });
      } else {
        console.log('📊 REJECTED USERS: 0 (none found)\n');
      }
    } else {
      console.log('\n⚠️  REJECTED status NOT in enum\n');
      console.log('Current rejection handling:');
      console.log('   Option 1: Delete rejected users from database');
      console.log('   Option 2: Use SUSPENDED status for rejections');
      console.log('   Option 3: Add REJECTED to enum for tracking\n');
    }

    // Check all users with their statuses
    console.log('═'.repeat(70));
    console.log('📊 ALL USERS IN DATABASE\n');

    const allUsers = await query(`
      SELECT 
        id, 
        email, 
        full_name,
        role, 
        status, 
        auth_provider,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    console.log(`Total Users: ${allUsers.rows.length}\n`);
    
    allUsers.rows.forEach((user: any) => {
      const authMethod = user.auth_provider === 'GOOGLE' ? '(Google)' : '(Email/Password)';
      console.log(`   ${user.email}`);
      console.log(`      Role: ${user.role} | Status: ${user.status} ${authMethod}`);
      console.log(`      Created: ${user.created_at}`);
      console.log('');
    });

    // Check for duplicate email attempts (would indicate re-registration attempts)
    console.log('═'.repeat(70));
    console.log('🔍 CHECKING FOR DUPLICATE EMAIL ATTEMPTS\n');

    const duplicates = await query(`
      SELECT 
        email,
        COUNT(*) as count,
        array_agg(status) as statuses
      FROM users
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicates.rows.length > 0) {
      console.log(`⚠️  Found ${duplicates.rows.length} duplicate emails:\n`);
      duplicates.rows.forEach((dup: any) => {
        console.log(`   ${dup.email}: ${dup.count} accounts with statuses: ${dup.statuses}`);
      });
    } else {
      console.log('✅ No duplicate emails - Each email is unique\n');
      console.log('This means:');
      console.log('   - Rejected users likely DELETED from database, OR');
      console.log('   - Unique email constraint prevents re-registration');
      console.log('   - Frontend/backend must handle "email already exists" error\n');
    }

    console.log('═'.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRejectionWorkflow();
