import pool from '../config/database';

const addSessionTimeoutColumn = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding session_timeout_minutes column to users table...');
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 15;
    `);
    
    console.log('✅ Successfully added session_timeout_minutes column');
    console.log('📝 Default value: 15 minutes');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addSessionTimeoutColumn();
