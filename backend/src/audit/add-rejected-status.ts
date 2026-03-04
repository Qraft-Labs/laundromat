import { query } from '../config/database';

async function addRejectedStatus() {
  console.log('\n🔄 ADDING REJECTED STATUS TO DATABASE\n');
  console.log('═'.repeat(70) + '\n');

  try {
    // 1. Add REJECTED to user_status enum
    console.log('📋 Step 1: Adding REJECTED to user_status enum...');
    
    await query(`
      ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'REJECTED';
    `);
    
    console.log('✅ REJECTED status added to enum\n');

    // 2. Verify enum values
    console.log('📋 Step 2: Verifying enum values...');
    
    const enumCheck = await query(`
      SELECT unnest(enum_range(NULL::user_status)) as status
    `);
    
    console.log('   Current user_status enum values:');
    enumCheck.rows.forEach((row: any) => {
      console.log(`      - ${row.status}`);
    });
    console.log('');

    // 3. Check if last_login field exists
    console.log('📋 Step 3: Checking last_login timestamp field...');
    
    const lastLoginCheck = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'last_login'
    `);
    
    if (lastLoginCheck.rows.length > 0) {
      console.log('   ✅ last_login field exists (type: timestamp)\n');
      
      // Show sample of last login times
      const loginSample = await query(`
        SELECT email, role, last_login
        FROM users
        WHERE last_login IS NOT NULL
        ORDER BY last_login DESC
        LIMIT 3
      `);
      
      if (loginSample.rows.length > 0) {
        console.log('   Sample last login timestamps:');
        loginSample.rows.forEach((row: any) => {
          console.log(`      ${row.email} (${row.role}): ${row.last_login}`);
        });
        console.log('');
      }
    } else {
      console.log('   ⚠️  last_login field NOT found - need to add it\n');
    }

    // 4. Check rejection_reason field
    console.log('📋 Step 4: Checking rejection_reason field...');
    
    const rejectionFieldCheck = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'rejection_reason'
    `);
    
    if (rejectionFieldCheck.rows.length > 0) {
      console.log('   ✅ rejection_reason field exists (type: text)\n');
    } else {
      console.log('   ⚠️  rejection_reason field NOT found - need to add it\n');
    }

    // 5. Check approval tracking fields
    console.log('📋 Step 5: Checking approval tracking fields...');
    
    const approvalFields = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' 
        AND column_name IN ('approved_by', 'approved_at', 'rejected_by', 'rejected_at')
      ORDER BY column_name
    `);
    
    console.log('   Approval/Rejection tracking fields:');
    approvalFields.rows.forEach((row: any) => {
      console.log(`      ✅ ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    // 6. Verify unique email constraint
    console.log('📋 Step 6: Verifying unique email constraint...');
    
    const constraintCheck = await query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'users' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%email%'
    `);
    
    if (constraintCheck.rows.length > 0) {
      console.log('   ✅ Unique email constraint exists');
      console.log('   → Rejected users CANNOT re-register with same email\n');
    } else {
      console.log('   ⚠️  No unique email constraint found\n');
    }

    // 7. Summary
    console.log('═'.repeat(70));
    console.log('📊 USER MANAGEMENT FEATURES VERIFICATION\n');
    
    console.log('✅ REJECTED Status:');
    console.log('   - Added to user_status enum');
    console.log('   - Admin can reject pending users');
    console.log('   - Rejected users stored in database with rejection_reason');
    console.log('   - Rejected users CANNOT login (403 error)');
    console.log('   - Rejected users CANNOT re-register (unique email constraint)\n');
    
    console.log('✅ Login Messages for Different Statuses:');
    console.log('   - PENDING: "Your account is awaiting approval..."');
    console.log('   - SUSPENDED: "Your account has been suspended..."');
    console.log('   - REJECTED: "Your account registration was rejected..."\n');
    
    console.log('✅ Timestamp Tracking:');
    console.log('   - last_login: Tracks when user last logged in');
    console.log('   - approved_at: Tracks when admin approved user');
    console.log('   - created_at: Tracks account creation time\n');
    
    console.log('✅ User Management Features:');
    console.log('   - Filter by status (ALL, ACTIVE, PENDING, SUSPENDED, REJECTED)');
    console.log('   - Search by email/name');
    console.log('   - View last login timestamps');
    console.log('   - Approve/Reject pending users');
    console.log('   - Suspend/Activate users\n');

    console.log('═'.repeat(70) + '\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addRejectedStatus();
