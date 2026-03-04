const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  try {
    console.log('🔍 Checking password_reset_requests table structure...\n');
    
    // Check current columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_requests' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}${row.column_default ? ' (default: ' + row.column_default + ')' : ''}`);
    });
    
    const hasStatusColumn = columnsResult.rows.some(row => row.column_name === 'status');
    
    if (!hasStatusColumn) {
      console.log('\n⚠️  Status column missing! Running migration...\n');
      
      // Read and execute migration
      const migrationSQL = fs.readFileSync('./migrations/update_password_reset_requests.sql', 'utf8');
      await pool.query(migrationSQL);
      
      console.log('✅ Migration completed successfully!\n');
      
      // Check again
      const updatedColumns = await pool.query(`
        SELECT column_name, data_type, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'password_reset_requests' 
        ORDER BY ordinal_position
      `);
      
      console.log('Updated columns:');
      updatedColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}${row.column_default ? ' (default: ' + row.column_default + ')' : ''}`);
      });
    } else {
      console.log('\n✅ Status column already exists!\n');
    }
    
    // Check if there are any requests
    const requestsResult = await pool.query(`
      SELECT 
        pr.id, pr.user_id, pr.requested_at, pr.status,
        u.email, u.full_name, u.role
      FROM password_reset_requests pr
      JOIN users u ON pr.user_id = u.id
      ORDER BY pr.requested_at DESC
    `);
    
    console.log(`\n📋 Total password reset requests: ${requestsResult.rows.length}`);
    if (requestsResult.rows.length > 0) {
      console.log('\nRequests:');
      requestsResult.rows.forEach(req => {
        console.log(`  - ${req.full_name} (${req.email}) - Status: ${req.status} - Requested: ${req.requested_at}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
