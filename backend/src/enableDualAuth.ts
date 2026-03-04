import { query } from './config/database';

async function enableDualAuth() {
  try {
    console.log('\n🔄 Updating database to allow dual authentication...\n');
    
    // Drop old constraint
    await query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS password_required_for_local_auth
    `);
    console.log('✅ Removed old password constraint');
    
    // Add new constraint
    await query(`
      ALTER TABLE users 
      ADD CONSTRAINT password_required_for_local_auth 
      CHECK (
        (auth_provider = 'GOOGLE') OR
        (auth_provider IS NULL AND password IS NOT NULL) OR
        (auth_provider = 'LOCAL' AND password IS NOT NULL)
      )
    `);
    console.log('✅ Added new constraint allowing dual authentication');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DUAL AUTHENTICATION ENABLED');
    console.log('='.repeat(60));
    console.log('\n📝 What this means:');
    console.log('   • Google OAuth users can optionally add a password');
    console.log('   • They can then login EITHER via Google OR email/password');
    console.log('   • LOCAL auth users must always have a password');
    console.log('   • Profile picture uploads work for all users\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

enableDualAuth();
