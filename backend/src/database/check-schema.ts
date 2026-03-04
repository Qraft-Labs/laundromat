import { query } from '../config/database';

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Check tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 EXISTING TABLES:');
    tables.rows.forEach((t: any) => console.log('  ✅', t.table_name));
    console.log(`\nTotal: ${tables.rows.length} tables\n`);

    // Check key tables structure
    const keyTables = ['users', 'customers', 'orders', 'order_items', 'price_items', 'payments'];
    
    for (const tableName of keyTables) {
      const columns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      if (columns.rows.length > 0) {
        console.log(`\n📋 ${tableName.toUpperCase()} table columns:`);
        columns.rows.forEach((col: any) => {
          console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log(`\n❌ ${tableName.toUpperCase()} table does NOT exist!`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSchema();
