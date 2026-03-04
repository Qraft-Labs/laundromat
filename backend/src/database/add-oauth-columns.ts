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

async function addOAuthColumns() {
  try {
    console.log('🔧 Adding OAuth columns to users table...\n');

    // Add google_id column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE
    `);
    console.log('✅ Added google_id column');

    // Add auth_provider column
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE auth_provider_type AS ENUM ('LOCAL', 'GOOGLE', 'DUAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS auth_provider auth_provider_type DEFAULT 'LOCAL'
    `);
    console.log('✅ Added auth_provider column');

    // Add profile_picture column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_picture TEXT
    `);
    console.log('✅ Added profile_picture column');

    // Add last_login column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
    `);
    console.log('✅ Added last_login column');

    console.log('\n✅ All OAuth columns added successfully!');
    console.log('\n📋 Users table now supports:');
    console.log('   - Google OAuth login (google_id)');
    console.log('   - Dual authentication (auth_provider)');
    console.log('   - Profile pictures (profile_picture)');
    console.log('   - Last login tracking (last_login)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding OAuth columns:', error);
    process.exit(1);
  }
}

addOAuthColumns();
