import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

async function runMigration() {
  try {
    console.log('Running business settings migration...');
    
    const sqlPath = path.join(__dirname, 'create-business-settings.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await query(sql);
    
    console.log('✅ Business settings table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
