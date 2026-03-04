import { query } from '../config/database';

async function checkColumns() {
  const result = await query(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name IN ('status', 'payment_status') 
    ORDER BY ordinal_position
  `);
  
  console.log('Orders status columns:');
  result.rows.forEach(c => {
    console.log(`  ${c.column_name}: ${c.data_type} (${c.udt_name})`);
  });
  
  process.exit(0);
}

checkColumns();
