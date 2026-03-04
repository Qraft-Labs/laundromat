import pool from '../config/database';

async function verifySessionTimeout() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying session_timeout_minutes column...\n');
    
    // Check if column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name = 'session_timeout_minutes'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ Column session_timeout_minutes does NOT exist in users table');
      console.log('\n🔧 Running migration now...\n');
      
      // Add the column
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN session_timeout_minutes INTEGER DEFAULT 15
      `);
      
      console.log('✅ Successfully added session_timeout_minutes column');
    } else {
      console.log('✅ Column session_timeout_minutes EXISTS');
      console.log('   Data type:', columnCheck.rows[0].data_type);
      console.log('   Default value:', columnCheck.rows[0].column_default);
    }
    
    // Show sample user data
    console.log('\n📋 Sample user data:');
    const users = await client.query(`
      SELECT id, email, full_name, role, session_timeout_minutes 
      FROM users 
      ORDER BY id 
      LIMIT 5
    `);
    
    if (users.rows.length === 0) {
      console.log('   No users found in database');
    } else {
      console.table(users.rows);
    }
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verifySessionTimeout();
