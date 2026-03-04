import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

async function runMigration() {
  try {
    console.log('Running notifications migration...');
    
    const sqlPath = path.join(__dirname, 'create-notifications.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await query(sql);
    
    console.log('✅ Notifications table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
