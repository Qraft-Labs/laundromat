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

async function fixPhoneNullable() {
  try {
    console.log('🔧 Making phone column nullable for Google OAuth users...\n');

    // Make phone column nullable
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN phone DROP NOT NULL
    `);
    console.log('✅ Phone column is now nullable');

    console.log('\n✅ Fix complete!');
    console.log('\n📋 Google OAuth users:');
    console.log('   - Can sign in without providing a phone number');
    console.log('   - Can add phone number later from their profile');
    console.log('   - Email/password users still need phone on signup');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing phone column:', error);
    process.exit(1);
  }
}

fixPhoneNullable();
