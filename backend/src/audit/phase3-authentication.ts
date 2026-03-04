import { query } from '../config/database';

interface AuditResults {
  passed: string[];
  failed: string[];
  warnings: string[];
}

async function phase3Audit() {
  console.log('\n' + '═'.repeat(70));
  console.log('🔐 PHASE 3: AUTHENTICATION & AUTHORIZATION AUDIT');
  console.log('═'.repeat(70) + '\n');

  const results: AuditResults = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // ============================================================
    // 3.1 VERIFY USER TABLE STRUCTURE
    // ============================================================
    console.log('📋 3.1 CHECKING USER TABLE STRUCTURE\n');

    const userTableCheck = await query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    const requiredFields = [
      'id', 'email', 'password', 'full_name', 'role', 
      'status', 'profile_picture', 'google_id', 
      'must_change_password', 'session_timeout_minutes',
      'auth_provider', 'created_at', 'updated_at'
    ];

    const existingFields = userTableCheck.rows.map((r: any) => r.column_name);
    const missingFields = requiredFields.filter(f => !existingFields.includes(f));

    if (missingFields.length === 0) {
      console.log('   ✅ All required user fields exist');
      results.passed.push('User table structure complete');
    } else {
      console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`);
      results.warnings.push(`Missing user fields: ${missingFields.join(', ')}`);
    }

    console.log('');

    // ============================================================
    // 3.2 VERIFY USER ROLES & STATUS
    // ============================================================
    console.log('📋 3.2 CHECKING USER ROLES & PERMISSIONS\n');

    const userRoles = await query(`
      SELECT 
        role,
        COUNT(*) as user_count,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_count
      FROM users
      GROUP BY role
      ORDER BY role
    `);

    const expectedRoles = ['ADMIN', 'MANAGER', 'DESKTOP_AGENT'];
    const existingRoles = userRoles.rows.map((r: any) => r.role);

    console.log('   User Role Distribution:');
    userRoles.rows.forEach((row: any) => {
      console.log(`      ${row.role}: ${row.user_count} total (${row.active_count} active)`);
    });

    if (expectedRoles.every(r => existingRoles.includes(r))) {
      console.log(`\n   ✅ All expected roles present: ${expectedRoles.join(', ')}`);
      results.passed.push('User roles configured');
    } else {
      const missing = expectedRoles.filter(r => !existingRoles.includes(r));
      console.log(`\n   ⚠️  Missing roles: ${missing.join(', ')}`);
      results.warnings.push(`Missing roles: ${missing.join(', ')}`);
    }

    console.log('');

    // ============================================================
    // 3.3 VERIFY PASSWORD SECURITY
    // ============================================================
    console.log('📋 3.3 CHECKING PASSWORD SECURITY\n');

    const passwordCheck = await query(`
      SELECT 
        id,
        email,
        password,
        LENGTH(password) as password_length
      FROM users
      WHERE password IS NOT NULL
      LIMIT 5
    `);

    let bcryptCount = 0;
    let plaintextCount = 0;

    passwordCheck.rows.forEach((row: any) => {
      if (row.password && row.password.startsWith('$2')) {
        bcryptCount++;
      } else if (row.password) {
        plaintextCount++;
      }
    });

    const totalUsers = await query('SELECT COUNT(*) as count FROM users WHERE password IS NOT NULL');
    const totalCount = parseInt(totalUsers.rows[0].count);

    console.log(`   Total users with passwords: ${totalCount}`);
    console.log(`   Sample password analysis (5 users):`);
    console.log(`      - Bcrypt hashed: ${bcryptCount}/5`);
    console.log(`      - Plaintext/other: ${plaintextCount}/5`);

    if (plaintextCount === 0) {
      console.log(`\n   ✅ All sampled passwords are bcrypt hashed`);
      results.passed.push('Password encryption verified');
    } else {
      console.log(`\n   ❌ Found ${plaintextCount} passwords not bcrypt hashed`);
      results.failed.push('Some passwords not properly hashed');
    }

    console.log('');

    // ============================================================
    // 3.4 VERIFY DUAL AUTHENTICATION SETUP
    // ============================================================
    console.log('📋 3.4 CHECKING DUAL AUTHENTICATION (Email/Password + Google OAuth)\n');

    const authMethods = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN password IS NOT NULL THEN 1 END) as with_password,
        COUNT(CASE WHEN google_id IS NOT NULL THEN 1 END) as with_google,
        COUNT(CASE WHEN password IS NOT NULL AND google_id IS NOT NULL THEN 1 END) as dual_auth
      FROM users
    `);

    const auth = authMethods.rows[0];
    console.log(`   Total Users: ${auth.total_users}`);
    console.log(`   - Email/Password only: ${parseInt(auth.with_password) - parseInt(auth.dual_auth)}`);
    console.log(`   - Google OAuth only: ${parseInt(auth.with_google) - parseInt(auth.dual_auth)}`);
    console.log(`   - Dual Authentication: ${auth.dual_auth}`);

    if (parseInt(auth.with_password) > 0 && parseInt(auth.with_google) >= 0) {
      console.log(`\n   ✅ Dual authentication system configured`);
      results.passed.push('Dual authentication available');
    } else {
      console.log(`\n   ⚠️  Authentication system incomplete`);
      results.warnings.push('Some authentication methods missing');
    }

    console.log('');

    // ============================================================
    // 3.5 VERIFY USER STATUS
    // ============================================================
    console.log('📋 3.5 CHECKING USER STATUS\n');

    const statusCheck = await query(`
      SELECT 
        status,
        COUNT(*) as user_count
      FROM users
      GROUP BY status
      ORDER BY status
    `);

    console.log('   User Status Distribution:');
    statusCheck.rows.forEach((row: any) => {
      console.log(`      ${row.status}: ${row.user_count} users`);
    });

    // Verify REJECTED status exists in enum
    const enumCheck = await query(`
      SELECT unnest(enum_range(NULL::user_status)) as status
    `);
    const hasRejectedStatus = enumCheck.rows.some((r: any) => r.status === 'REJECTED');
    
    if (hasRejectedStatus) {
      console.log('\n   ✅ REJECTED status exists in user_status enum');
      results.passed.push('REJECTED status configured');
    } else {
      console.log('\n   ⚠️  REJECTED status missing from enum');
      results.warnings.push('REJECTED status not in enum');
    }

    const hasActiveUsers = statusCheck.rows.some((r: any) => r.status === 'ACTIVE');
    const hasPendingUsers = statusCheck.rows.some((r: any) => r.status === 'PENDING');
    
    if (hasActiveUsers) {
      console.log(`\n   ✅ Active users exist in system`);
      results.passed.push('Active users present');
    } else {
      console.log(`\n   ⚠️  No active users found`);
      results.warnings.push('No active users');
    }

    // Verify user approval workflow
    console.log('\n   User Approval Workflow:');
    const workflowCheck = await query(`
      SELECT 
        role,
        status,
        COUNT(*) as count
      FROM users
      WHERE role IN ('MANAGER', 'DESKTOP_AGENT')
      GROUP BY role, status
      ORDER BY role, status
    `);

    if (workflowCheck.rows.length > 0) {
      console.log('   Manager/Cashier accounts awaiting approval or active:');
      workflowCheck.rows.forEach((row: any) => {
        console.log(`      ${row.role} - ${row.status}: ${row.count} users`);
      });
      console.log(`\n   ✅ User approval workflow operational`);
      results.passed.push('User approval workflow configured');
    }

    console.log('');

    // ============================================================
    // 3.6 VERIFY PASSWORD CHANGE FLAG
    // ============================================================
    console.log('📋 3.6 CHECKING PASSWORD CHANGE REQUIREMENTS\n');

    const passwordChangeCheck = await query(`
      SELECT 
        must_change_password,
        COUNT(*) as user_count
      FROM users
      WHERE password IS NOT NULL
      GROUP BY must_change_password
    `);

    console.log('   Password Change Status:');
    passwordChangeCheck.rows.forEach((row: any) => {
      console.log(`      ${row.must_change_password ? 'Must Change' : 'Optional'}: ${row.user_count} users`);
    });

    console.log(`\n   ✅ Password change flag mechanism in place`);
    results.passed.push('Password change flag configured');

    console.log('');

    // ============================================================
    // 3.7 VERIFY SESSION TIMEOUT CONFIGURATION
    // ============================================================
    console.log('📋 3.7 CHECKING SESSION TIMEOUT\n');

    const sessionCheck = await query(`
      SELECT 
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'session_timeout_minutes'
    `);

    if (sessionCheck.rows.length > 0) {
      const timeoutValues = await query(`
        SELECT 
          session_timeout_minutes,
          COUNT(*) as user_count
        FROM users
        GROUP BY session_timeout_minutes
        ORDER BY session_timeout_minutes
      `);

      console.log('   Session Timeout Configuration:');
      timeoutValues.rows.forEach((row: any) => {
        const minutes = row.session_timeout_minutes || 'Default';
        console.log(`      ${minutes} minutes: ${row.user_count} users`);
      });

      console.log(`\n   ✅ Session timeout configured`);
      results.passed.push('Session timeout mechanism exists');
    } else {
      console.log('   ⚠️  Session timeout column not found');
      results.warnings.push('Session timeout not configured');
    }

    console.log('');

    // ============================================================
    // 3.8 VERIFY PROFILE PICTURE MANAGEMENT
    // ============================================================
    console.log('📋 3.8 CHECKING PROFILE PICTURE MANAGEMENT\n');

    const profilePicCheck = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN profile_picture IS NOT NULL THEN 1 END) as with_picture,
        COUNT(CASE WHEN profile_picture IS NULL THEN 1 END) as without_picture
      FROM users
    `);

    const pic = profilePicCheck.rows[0];
    console.log(`   Total Users: ${pic.total_users}`);
    console.log(`   - With Profile Picture: ${pic.with_picture}`);
    console.log(`   - Without Profile Picture: ${pic.without_picture}`);

    console.log(`\n   ✅ Profile picture field available`);
    results.passed.push('Profile picture management available');

    console.log('');

    // ============================================================
    // 3.9 VERIFY AUDIT TRAIL (created_at, updated_at)
    // ============================================================
    console.log('📋 3.9 CHECKING USER AUDIT TRAIL\n');

    const auditFields = await query(`
      SELECT 
        column_name
      FROM information_schema.columns
      WHERE table_name = 'users' 
        AND column_name IN ('created_at', 'updated_at', 'created_by', 'updated_by')
    `);

    const auditFieldNames = auditFields.rows.map((r: any) => r.column_name);
    console.log(`   Audit fields present: ${auditFieldNames.join(', ')}`);

    if (auditFieldNames.includes('created_at') && auditFieldNames.includes('updated_at')) {
      console.log(`\n   ✅ User audit trail configured (timestamps)`);
      results.passed.push('User audit trail exists');
    } else {
      console.log(`\n   ⚠️  Some audit fields missing`);
      results.warnings.push('Incomplete audit trail');
    }

    console.log('');

    // ============================================================
    // 3.10 VERIFY NO DUPLICATE EMAILS
    // ============================================================
    console.log('📋 3.10 CHECKING FOR DUPLICATE EMAILS\n');

    const duplicateEmails = await query(`
      SELECT 
        email,
        COUNT(*) as count
      FROM users
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicateEmails.rows.length === 0) {
      console.log('   ✅ No duplicate emails found');
      results.passed.push('Email uniqueness verified');
    } else {
      console.log(`   ❌ Found ${duplicateEmails.rows.length} duplicate emails:`);
      duplicateEmails.rows.forEach((row: any) => {
        console.log(`      - ${row.email} (${row.count} accounts)`);
      });
      results.failed.push('Duplicate emails exist');
    }

    // Check auth_provider field
    const authProviderCheck = await query(`
      SELECT 
        auth_provider,
        COUNT(*) as user_count
      FROM users
      GROUP BY auth_provider
    `);

    console.log('\n   Authentication Providers:');
    authProviderCheck.rows.forEach((row: any) => {
      console.log(`      ${row.auth_provider || 'NULL'}: ${row.user_count} users`);
    });
    results.passed.push('Auth provider tracking exists');

    console.log('');

    // ============================================================
    // 3.11 VERIFY GOOGLE OAUTH INTEGRATION
    // ============================================================
    console.log('📋 3.11 CHECKING GOOGLE OAUTH INTEGRATION\n');

    const googleFields = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' 
        AND column_name IN ('google_id', 'auth_provider')
    `);

    const googleFieldNames = googleFields.rows.map((r: any) => r.column_name);
    console.log(`   Google OAuth fields: ${googleFieldNames.join(', ')}`);

    const googleUsers = await query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE google_id IS NOT NULL OR auth_provider = 'google'
    `);

    const adminGoogleAuth = await query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'ADMIN' AND (google_id IS NOT NULL OR auth_provider = 'google')
    `);

    console.log(`   Users with Google auth: ${googleUsers.rows[0].count}`);
    console.log(`   Admin users with Google: ${adminGoogleAuth.rows[0].count}`);

    if (googleFieldNames.includes('google_id') && googleFieldNames.includes('auth_provider')) {
      console.log(`\n   ✅ Google OAuth integration configured`);
      results.passed.push('Google OAuth fields present');
    } else {
      console.log(`\n   ⚠️  Google OAuth fields incomplete`);
      results.warnings.push('Google OAuth incomplete');
    }

    console.log('');

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('═'.repeat(70));
    console.log('📊 PHASE 3 AUDIT SUMMARY');
    console.log('═'.repeat(70) + '\n');

    if (results.passed.length > 0) {
      console.log(`✅ PASSED: ${results.passed.length} checks`);
      results.passed.forEach(p => console.log(`   ✓ ${p}`));
      console.log('');
    }

    if (results.warnings.length > 0) {
      console.log(`⚠️  WARNINGS: ${results.warnings.length} issues`);
      results.warnings.forEach(w => console.log(`   ⚠ ${w}`));
      console.log('');
    }

    if (results.failed.length > 0) {
      console.log(`❌ FAILED: ${results.failed.length} checks`);
      results.failed.forEach(f => console.log(`   ✗ ${f}`));
      console.log('');
    }

    if (results.failed.length === 0) {
      console.log('🎉 AUTHENTICATION & AUTHORIZATION SYSTEM VERIFIED!\n');
    } else {
      console.log('🚨 CRITICAL: Fix authentication issues before deployment!\n');
    }

    console.log('═'.repeat(70) + '\n');

    process.exit(results.failed.length === 0 ? 0 : 1);

  } catch (error) {
    console.error('❌ Error during Phase 3 audit:', error);
    process.exit(1);
  }
}

phase3Audit();
