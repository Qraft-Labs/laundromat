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

async function fixPasswordNullable() {
  try {
    console.log('🔧 Making password column nullable for Google OAuth users...\n');

    // Make password column nullable
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN password DROP NOT NULL
    `);
    console.log('✅ Password column is now nullable');

    console.log('\n✅ Fix complete!');
    console.log('\n📋 Users can now:');
    console.log('   - Sign in with Google (no password needed)');
    console.log('   - Add password later for dual authentication');
    console.log('   - Sign in with email/password if password is set');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing password column:', error);
    process.exit(1);
  }
}

fixPasswordNullable();
