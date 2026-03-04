import { query } from './src/config/database';

async function checkServiceTypes() {
  const result = await query(`SELECT DISTINCT service_type FROM order_items WHERE service_type IS NOT NULL`);
  console.log('\n===== VALID SERVICE TYPES =====');
  result.rows.forEach(row => console.log(row.service_type));
  process.exit(0);
}

checkServiceTypes();
