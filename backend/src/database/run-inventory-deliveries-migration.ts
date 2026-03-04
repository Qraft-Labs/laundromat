import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  try {
    console.log('📦 Creating inventory and deliveries tables...');
    
    // Drop existing tables if they exist
    console.log('🗑️  Dropping existing tables if any...');
    await pool.query(`
      DROP TABLE IF EXISTS inventory_transactions CASCADE;
      DROP TABLE IF EXISTS inventory_items CASCADE;
      DROP TABLE IF EXISTS deliveries CASCADE;
    `);
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'create-inventory-deliveries.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✅ Inventory and deliveries tables created successfully!');
    console.log('📝 Adding sample inventory data...');
    
    // Add sample inventory items
    await pool.query(`
      INSERT INTO inventory_items (name, category, unit, quantity_in_stock, reorder_level, unit_cost, supplier)
      VALUES 
        ('Ariel Detergent', 'DETERGENT', 'kg', 50.00, 10.00, 15000, 'Procter & Gamble Uganda'),
        ('OMO Powder', 'DETERGENT', 'kg', 35.00, 10.00, 12000, 'Unilever Uganda'),
        ('Liquid Fabric Softener', 'DETERGENT', 'liters', 25.00, 5.00, 8000, 'Local Supplier'),
        ('Bleach', 'DETERGENT', 'liters', 15.00, 5.00, 6000, 'Local Supplier'),
        ('Plastic Hangers', 'HANGER', 'pieces', 500.00, 100.00, 500, 'China Imports Ltd'),
        ('Wooden Hangers', 'HANGER', 'pieces', 200.00, 50.00, 1500, 'Local Carpentry'),
        ('Garment Bags', 'PACKAGING', 'pieces', 1000.00, 200.00, 800, 'Packaging Solutions'),
        ('Plastic Wrapping', 'PACKAGING', 'rolls', 50.00, 10.00, 5000, 'Packaging Solutions'),
        ('Tags/Labels', 'PACKAGING', 'pieces', 5000.00, 1000.00, 50, 'Print Shop'),
        ('Stain Remover', 'DETERGENT', 'bottles', 20.00, 5.00, 12000, 'Local Supplier'),
        ('Ironing Board Covers', 'ACCESSORY', 'pieces', 10.00, 3.00, 15000, 'Home Essentials'),
        ('Dry Cleaning Solvent', 'DETERGENT', 'liters', 40.00, 10.00, 25000, 'Specialized Chemicals Ltd')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Sample inventory data added!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - Inventory items table created');
    console.log('   - Inventory transactions table created');
    console.log('   - Deliveries table created');
    console.log('   - 12 sample inventory items added');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
