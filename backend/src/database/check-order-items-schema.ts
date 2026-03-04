import { query } from '../config/database';

async function checkOrderItemsSchema() {
  try {
    console.log('📊 Checking order_items table schema...\n');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    result.rows.forEach((row: any) => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrderItemsSchema();
