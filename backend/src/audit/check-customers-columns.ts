import { query } from '../config/database';

async function checkCustomersStructure() {
  const result = await query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'customers'
    ORDER BY ordinal_position
  `);

  console.log('\nCustomers table columns:');
  result.rows.forEach(row => {
    console.log(`  - ${row.column_name}: ${row.data_type}`);
  });

  process.exit(0);
}

checkCustomersStructure();
