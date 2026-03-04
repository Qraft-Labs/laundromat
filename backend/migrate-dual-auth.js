const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigration() {
  try {
    console.log('🔄 Adding DUAL authentication support...\n');

    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add_dual_auth_support.sql'),
      'utf8'
    );

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    
    // Verify the changes
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        full_name, 
        auth_provider,
        (password IS NOT NULL) as has_password,
        google_id IS NOT NULL as has_google_id
      FROM users 
      WHERE auth_provider = 'DUAL' OR email LIKE '%husseinibram%'
    `);

    if (result.rows.length > 0) {
      console.log('📊 Users with Dual Authentication:');
      console.log('═'.repeat(80));
      for (const user of result.rows) {
        console.log(`✅ ${user.full_name} (${user.email})`);
        console.log(`   Auth Provider: ${user.auth_provider}`);
        console.log(`   Has Password: ${user.has_password}`);
        console.log(`   Has Google: ${user.has_google_id}`);
        console.log('');
      }
    } else {
      console.log('⚠️  No users with dual authentication found.');
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
