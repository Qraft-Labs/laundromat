import { query } from '../config/database';

async function checkCustomersTable() {
  const result = await query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'customers' 
    ORDER BY ordinal_position
  `);
  
  console.log('\n📋 CUSTOMERS TABLE COLUMNS:');
  console.log('-'.repeat(50));
  result.rows.forEach(col => {
    console.log(`   ${col.column_name.padEnd(30)} (${col.data_type})`);
  });
  console.log('');
}

checkCustomersTable().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
