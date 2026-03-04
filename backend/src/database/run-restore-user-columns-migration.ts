import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function runMigration() {
  try {
    console.log('🔧 Running restore missing user columns migration...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'restore_missing_user_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the migration
    await pool.query(sql);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Users table now has:');
    console.log('   - must_change_password (for password reset flows)');
    console.log('   - last_login (tracks when user last logged in)');
    console.log('   - created_at (tracks account creation)');
    console.log('   - updated_at (auto-updates on any change)');
    console.log('   - Trigger to auto-update updated_at timestamp');

    // Verify the columns exist
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('must_change_password', 'last_login', 'created_at', 'updated_at')
      ORDER BY column_name
    `);

    console.log('\n🔍 Verified columns:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
