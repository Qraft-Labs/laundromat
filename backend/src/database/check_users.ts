import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkUsers() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all users with their roles
    const result = await client.query(`
      SELECT id, email, full_name, role, status, session_timeout_minutes, created_at
      FROM users
      ORDER BY id
    `);

    console.log('📋 Current Users in Database:\n');
    console.log('ID | Email                        | Full Name           | Role            | Status   | Timeout | Created');
    console.log('---|------------------------------|---------------------|-----------------|----------|---------|------------------');
    
    result.rows.forEach(user => {
      console.log(
        `${user.id.toString().padEnd(3)}| ${user.email.padEnd(29)}| ${user.full_name.padEnd(20)}| ${user.role.padEnd(16)}| ${user.status.padEnd(9)}| ${user.session_timeout_minutes || 15}min    | ${new Date(user.created_at).toLocaleDateString()}`
      );
    });

    console.log('\n📊 Summary:');
    console.log(`Total Users: ${result.rows.length}`);
    console.log(`Admins: ${result.rows.filter(u => u.role === 'ADMIN').length}`);
    console.log(`Desktop Agents: ${result.rows.filter(u => u.role === 'DESKTOP_AGENT').length}`);
    console.log(`Cashiers (USER): ${result.rows.filter(u => u.role === 'USER').length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkUsers();
