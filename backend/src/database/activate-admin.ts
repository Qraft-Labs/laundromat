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

async function activateAdmin() {
  try {
    console.log('🔧 Activating admin account...\n');

    // Activate the Google OAuth admin account
    const result = await pool.query(`
      UPDATE users 
      SET status = 'ACTIVE'
      WHERE email = 'husseinibram555@gmail.com'
      RETURNING id, email, full_name, role, status, auth_provider
    `);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Account activated successfully!\n');
      console.log('User Details:');
      console.log('  Email:', user.email);
      console.log('  Name:', user.full_name);
      console.log('  Role:', user.role);
      console.log('  Status:', user.status);
      console.log('  Auth:', user.auth_provider);
      console.log('\n🎉 You can now log in with Google!');
    } else {
      console.log('❌ No user found with that email');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error activating account:', error);
    process.exit(1);
  }
}

activateAdmin();
