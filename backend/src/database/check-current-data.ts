import pool from '../config/database.js';

const checkData = async () => {
  try {
    const inventory = await pool.query('SELECT COUNT(*) FROM inventory_items');
    console.log('✅ Inventory items:', inventory.rows[0].count);
    
    const employees = await pool.query('SELECT COUNT(*) FROM payroll_employees');
    console.log('✅ Employees:', employees.rows[0].count);
    
    const orders = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN payment_status != 'PAID' THEN 1 END) as unpaid
      FROM orders
    `);
    console.log('✅ Orders:', orders.rows[0].total, '(', orders.rows[0].unpaid, 'unpaid )');
    
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : String(err));
  } finally {
    await pool.end();
  }
};

checkData();
