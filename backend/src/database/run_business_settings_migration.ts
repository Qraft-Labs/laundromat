import { query } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Running business_settings migration...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create_business_settings_table.sql'),
      'utf8'
    );
    
    await query(sql);
    
    console.log('✅ Migration successful!');
    console.log('📋 Verifying table...');
    
    const result = await query('SELECT * FROM business_settings ORDER BY setting_key');
    console.log('\n📊 Business Settings:');
    result.rows.forEach((row: any) => {
      console.log(`  ${row.setting_key}:`, JSON.stringify(row.setting_value, null, 2));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
