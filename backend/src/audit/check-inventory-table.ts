import { query } from '../config/database';

async function checkInventoryTable() {
  try {
    console.log('\n═══════════════════════════════════════════════');
    console.log('📦 CHECKING INVENTORY TABLE STRUCTURE');
    console.log('═══════════════════════════════════════════════\n');

    // Check if inventory_items table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'inventory_items'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ inventory_items table does NOT exist!\n');
      
      // Check for alternative table names
      const tablesResult = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%invent%'
        ORDER BY table_name
      `);
      
      console.log('Tables with "invent" in name:');
      if (tablesResult.rows.length === 0) {
        console.log('  (none found)\n');
      } else {
        tablesResult.rows.forEach((row: any) => {
          console.log(`  - ${row.table_name}`);
        });
        console.log();
      }
      
      process.exit(1);
    }
    
    console.log('✅ inventory_items table EXISTS\n');
    
    // Get column information
    const columnsResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'inventory_items'
      ORDER BY ordinal_position
    `);
    
    console.log('Columns:');
    columnsResult.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log();
    
    // Count rows
    const countResult = await query('SELECT COUNT(*) as count FROM inventory_items');
    console.log(`Total items: ${countResult.rows[0].count}\n`);
    
    // Show sample data
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleResult = await query('SELECT * FROM inventory_items LIMIT 3');
      console.log('Sample data:');
      sampleResult.rows.forEach((row: any, idx: number) => {
        console.log(`\nItem ${idx + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
      });
    } else {
      console.log('⚠️  No inventory items found in database');
    }
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ CHECK COMPLETE');
    console.log('═══════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

checkInventoryTable();
