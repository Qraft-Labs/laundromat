import pool from '../config/database';

async function checkTables() {
  console.log('🔍 Checking Database Tables...\n');

  try {
    // Check payments table
    console.log('1️⃣ Checking payments table...');
    const paymentsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payments'
      );
    `);
    console.log('Payments table exists:', paymentsCheck.rows[0].exists);

    if (paymentsCheck.rows[0].exists) {
      // Check payments table structure
      const paymentsColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'payments'
        ORDER BY ordinal_position;
      `);
      console.log('Payments columns:', paymentsColumns.rows);
    }

    // Check deliveries table
    console.log('\n2️⃣ Checking deliveries table...');
    const deliveriesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'deliveries'
      );
    `);
    console.log('Deliveries table exists:', deliveriesCheck.rows[0].exists);

    if (deliveriesCheck.rows[0].exists) {
      // Check deliveries table structure
      const deliveriesColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'deliveries'
        ORDER BY ordinal_position;
      `);
      console.log('Deliveries columns:', deliveriesColumns.rows);
    }

    // Check users table
    console.log('\n3️⃣ Checking users table...');
    const usersColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      AND column_name IN ('status', 'deleted_at')
      ORDER BY ordinal_position;
    `);
    console.log('Users status/deleted_at columns:', usersColumns.rows);

    console.log('\n✅ Table check complete!');
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Details:', error);
  } finally {
    await pool.end();
  }
}

checkTables();
