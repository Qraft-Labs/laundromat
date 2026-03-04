import pool from '../config/database';

pool.query(`
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'inventory_items' 
  ORDER BY ordinal_position
`).then(r => { 
  console.log('Inventory columns:', r.rows.map(x => x.column_name).join(', ')); 
  pool.end(); 
});
