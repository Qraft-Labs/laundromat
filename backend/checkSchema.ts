import { query } from './src/config/database';

async function checkOrderItemsSchema() {
  const result = await query(
    `SELECT column_name, data_type, is_nullable, column_default 
     FROM information_schema.columns 
     WHERE table_name = 'order_items' 
     ORDER BY ordinal_position`
  );
  
  console.log('\n===== ORDER_ITEMS TABLE SCHEMA =====');
  result.rows.forEach(col => {
    console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
  });
  
  process.exit(0);
}

checkOrderItemsSchema();
