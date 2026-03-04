const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'inventory_items' 
  ORDER BY ordinal_position
`)
.then(result => {
  console.log('Inventory Items Columns:');
  console.log(JSON.stringify(result.rows, null, 2));
  pool.end();
})
.catch(error => {
  console.error('Error:', error.message);
  pool.end();
  process.exit(1);
});
