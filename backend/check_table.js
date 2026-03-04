const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lush_laundry',
  user: 'postgres',
  password: '551129'
});

(async () => {
  const r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'business_settings'");
  console.table(r.rows);
  await pool.end();
})();
