import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function restoreMissingColumns() {
  console.log('🔄 Restoring missing columns from original GitHub schema...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'restore_missing_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Running migration...\n');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!\n');

    // Verify the changes
    console.log('📊 ORDERS TABLE STRUCTURE:');
    const ordersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position;
    `);
    console.table(ordersColumns.rows);

    console.log('\n📊 INVENTORY TABLE STRUCTURE:');
    const inventoryColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'inventory_items'
      ORDER BY ordinal_position;
    `);
    console.table(inventoryColumns.rows);

    console.log('\n✅ Database schema restored to match GitHub version!');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

restoreMissingColumns();
