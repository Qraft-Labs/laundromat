import { query } from '../config/database';

async function checkOrdersColumns() {
  const result = await query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    ORDER BY ordinal_position
  `);
  
  console.log('Orders table columns:');
  result.rows.forEach((row: any) => console.log('  -', row.column_name));
  process.exit(0);
}

checkOrdersColumns();
