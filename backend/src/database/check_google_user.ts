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

async function checkGoogleUser() {
  try {
    console.log('🔍 Checking Google OAuth user data...\n');
    
    // Check if profile_picture column exists
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ profile_picture column does NOT exist!\n');
    } else {
      console.log('✅ profile_picture column exists:');
      console.table(columnCheck.rows);
      console.log('');
    }
    
    // Get your Google user data
    const result = await pool.query(`
      SELECT id, email, full_name, role, auth_provider, google_id,
             profile_picture,
             CASE 
               WHEN profile_picture IS NULL THEN 'NULL'
               WHEN profile_picture = '' THEN 'EMPTY'
               ELSE 'HAS VALUE'
             END as pic_status,
             created_at, updated_at
      FROM users 
      WHERE email = 'husseinibram555@gmail.com'
    `);

    if (result.rows.length === 0) {
      console.log('❌ User not found with email husseinibram555@gmail.com\n');
    } else {
      console.log('✅ User found:');
      console.table(result.rows);
      
      if (result.rows[0].profile_picture) {
        console.log('\n📸 Profile Picture URL:');
        console.log(result.rows[0].profile_picture);
      } else {
        console.log('\n❌ Profile picture is NULL or empty in database!');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkGoogleUser();
