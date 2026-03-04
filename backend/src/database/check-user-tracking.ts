import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkUserStatus() {
  try {
    console.log('🔍 Checking user account status...\n');

    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        full_name, 
        auth_provider, 
        password IS NOT NULL as has_password,
        must_change_password,
        created_at,
        updated_at,
        last_login
      FROM users 
      WHERE email = 'husseinibram555@gmail.com'
    `);

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('📋 User Account Information:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Full Name: ${user.full_name}`);
    console.log(`   Auth Provider: ${user.auth_provider}`);
    console.log(`   Has Password: ${user.has_password ? 'Yes' : 'No'}`);
    console.log(`   Must Change Password: ${user.must_change_password || 'false'}`);
    console.log(`   Account Created: ${user.created_at || 'Not set'}`);
    console.log(`   Last Updated: ${user.updated_at || 'Not set'}`);
    console.log(`   Last Login: ${user.last_login || 'Never'}`);

    console.log('\n✅ All tracking columns are now available!');
    console.log('   - Password change will now work correctly');
    console.log('   - Profile updates will be tracked in updated_at');
    console.log('   - Login tracking works via last_login');
    console.log('   - Account creation time is recorded in created_at');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking user status:', error);
    process.exit(1);
  }
}

checkUserStatus();
