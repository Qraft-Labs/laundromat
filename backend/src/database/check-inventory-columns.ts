import { query } from '../config/database';

async function checkInventoryColumns() {
  try {
    console.log('Checking inventory_items columns...');
    const itemsResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_items' 
      ORDER BY ordinal_position
    `);
    console.log('inventory_items columns:', itemsResult.rows.map(r => r.column_name).join(', '));

    console.log('\nChecking inventory_transactions columns...');
    const transResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_transactions' 
      ORDER BY ordinal_position
    `);
    console.log('inventory_transactions columns:', transResult.rows.map(r => r.column_name).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkInventoryColumns();
