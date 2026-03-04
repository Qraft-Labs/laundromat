import pool from '../config/database.js';

const checkInventorySchema = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_items' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 inventory_items table columns:\n');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    console.log('');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
};

checkInventorySchema();
