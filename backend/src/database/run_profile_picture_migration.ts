import dotenv from 'dotenv';
import { Pool } from 'pg';

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
    console.log('🔧 Adding profile_picture column to users table...\n');
    
    // Add the column if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);
    `);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify the column was added
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'profile_picture';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Column verified:');
      console.table(result.rows);
    } else {
      console.log('❌ Column was not created!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runMigration();
