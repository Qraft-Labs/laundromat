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

async function checkProfilePictures() {
  try {
    console.log('Checking Google OAuth users and their profile pictures...\n');
    
    const result = await pool.query(`
      SELECT id, email, full_name, role, auth_provider, 
             CASE 
               WHEN profile_picture IS NULL THEN 'NULL'
               WHEN profile_picture = '' THEN 'EMPTY STRING'
               ELSE LEFT(profile_picture, 50) || '...'
             END as profile_picture_status,
             status
      FROM users 
      WHERE auth_provider = 'GOOGLE' OR email LIKE '%gmail%'
      ORDER BY id
    `);

    if (result.rows.length === 0) {
      console.log('No Google OAuth users found.');
    } else {
      console.log('Google OAuth Users:');
      console.table(result.rows);
    }

    // Also check the column structure
    console.log('\nChecking if profile_picture column exists...');
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ profile_picture column exists:');
      console.table(columnCheck.rows);
    } else {
      console.log('❌ profile_picture column does NOT exist in users table!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProfilePictures();
