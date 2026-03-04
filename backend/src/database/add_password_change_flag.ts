import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addPasswordChangeFlag() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'must_change_password'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  Column must_change_password already exists');
      return;
    }

    // Add must_change_password column
    console.log('Adding must_change_password column...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE
    `);

    console.log('✅ Column must_change_password added successfully');
    
    // Verify
    const verify = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name = 'must_change_password'
    `);

    console.log('\n📋 Verification:');
    console.log('Column:', verify.rows[0].column_name);
    console.log('Type:', verify.rows[0].data_type);
    console.log('Default:', verify.rows[0].column_default);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

addPasswordChangeFlag();
