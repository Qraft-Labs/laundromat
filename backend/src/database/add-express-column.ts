import { query } from '../config/database';

async function addExpressPriceColumn() {
  try {
    console.log('Adding express_price column to price_items...');
    
    await query(`
      ALTER TABLE price_items 
      ADD COLUMN IF NOT EXISTS express_price DECIMAL(10, 2) DEFAULT NULL
    `);
    
    console.log('✅ express_price column added successfully!');
    console.log('NULL = automatic (2x wash price)');
    console.log('Number = custom express price');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding express_price column:', error);
    process.exit(1);
  }
}

addExpressPriceColumn();
