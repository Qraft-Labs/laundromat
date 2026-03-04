const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkDualAuth() {
  try {
    console.log('🔍 Checking admin account authentication status...\n');

    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        full_name, 
        role, 
        auth_provider,
        google_id,
        (password IS NOT NULL) as has_password,
        profile_picture,
        last_login
      FROM users 
      WHERE email = $1`,
      ['husseinibram555@gmail.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin account not found!');
      process.exit(1);
    }

    const user = result.rows[0];
    
    console.log('📊 Account Details:');
    console.log('═'.repeat(60));
    console.log(`👤 Name:           ${user.full_name}`);
    console.log(`📧 Email:          ${user.email}`);
    console.log(`👑 Role:           ${user.role}`);
    console.log(`🔐 Auth Provider:  ${user.auth_provider}`);
    console.log(`🔗 Google ID:      ${user.google_id || 'Not linked'}`);
    console.log(`🔑 Has Password:   ${user.has_password ? 'Yes ✅' : 'No ❌'}`);
    console.log(`🖼️  Profile Pic:    ${user.profile_picture || 'Not set'}`);
    console.log(`⏰ Last Login:     ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}`);
    console.log('═'.repeat(60));
    
    console.log('\n🎯 Authentication Status:');
    console.log('-'.repeat(60));
    
    if (user.auth_provider === 'DUAL') {
      console.log('✅ DUAL AUTHENTICATION ENABLED');
      console.log('   ✓ Can login with Google');
      console.log('   ✓ Can login with email + password');
      console.log('\n🎉 Both login methods are available!');
    } else if (user.auth_provider === 'GOOGLE') {
      if (user.has_password) {
        console.log('⚠️  NEEDS UPDATE TO DUAL');
        console.log('   ✓ Google ID linked');
        console.log('   ✓ Password is set');
        console.log('   ❌ auth_provider still says GOOGLE');
        console.log('\n💡 Updating to DUAL now...');
        
        await pool.query(
          'UPDATE users SET auth_provider = $1 WHERE id = $2',
          ['DUAL', user.id]
        );
        
        console.log('✅ Updated! Now you have dual authentication.');
      } else {
        console.log('⚠️  GOOGLE ONLY');
        console.log('   ✓ Can login with Google');
        console.log('   ❌ Cannot login with email + password (no password set)');
        console.log('\n💡 To enable dual auth:');
        console.log('   1. Login with Google');
        console.log('   2. Go to Profile page');
        console.log('   3. Set a password in "Add Password" section');
      }
    } else if (user.auth_provider === 'LOCAL') {
      console.log('⚠️  LOCAL ONLY');
      console.log('   ✓ Can login with email + password');
      console.log('   ❌ Cannot login with Google (not linked)');
    } else {
      console.log(`❓ Unknown auth provider: ${user.auth_provider}`);
    }
    
    console.log('-'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDualAuth();
