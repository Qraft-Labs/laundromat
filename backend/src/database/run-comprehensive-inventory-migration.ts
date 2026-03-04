import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

const runMigration = async () => {
  const client = await pool.connect();
  
  try {
    console.log('📦 Creating/updating inventory tables...\n');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'create-inventory-deliveries.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query('BEGIN');
    await client.query(sql);
    
    console.log('✅ Tables created/updated successfully!\n');
    
    console.log('📝 Adding comprehensive inventory data for Ugandan dry cleaner...\n');
    
    // Clear existing inventory items
    await client.query('DELETE FROM inventory_items');
    
    // Comprehensive inventory for a Ugandan dry cleaning business
    const inventoryItems = [
      // DETERGENTS & SOAPS
      { name: 'Ariel Detergent Powder', category: 'DETERGENT', unit: 'kg', stock: 50, reorder: 20, cost: 8500, supplier: 'Ariel Uganda Ltd', notes: 'For general washing' },
      { name: 'OMO Power Detergent', category: 'DETERGENT', unit: 'kg', stock: 35, reorder: 15, cost: 7800, supplier: 'Unilever Uganda', notes: 'Heavy-duty cleaning' },
      { name: 'Persil Professional Detergent', category: 'DETERGENT', unit: 'kg', stock: 25, reorder: 10, cost: 12000, supplier: 'Professional Supplies Ltd', notes: 'Premium quality' },
      { name: 'Surf Excel Washing Powder', category: 'DETERGENT', unit: 'kg', stock: 40, reorder: 15, cost: 6500, supplier: 'Unilever Uganda', notes: 'Economy option' },
      { name: 'Liquid Laundry Detergent', category: 'DETERGENT', unit: 'liters', stock: 30, reorder: 10, cost: 15000, supplier: 'Pro Clean Supplies', notes: 'For delicate fabrics' },
      
      // CHEMICALS & STAIN REMOVERS
      { name: 'Vanish Stain Remover', category: 'CHEMICAL', unit: 'kg', stock: 15, reorder: 5, cost: 18000, supplier: 'Professional Supplies Ltd', notes: 'Tough stain treatment' },
      { name: 'Bleach (Jik)', category: 'CHEMICAL', unit: 'liters', stock: 25, reorder: 10, cost: 4500, supplier: 'Local Supermarket', notes: 'For whites and sanitizing' },
      { name: 'Fabric Softener (Comfort)', category: 'CHEMICAL', unit: 'liters', stock: 20, reorder: 8, cost: 8000, supplier: 'Unilever Uganda', notes: 'Makes clothes soft' },
      { name: 'Dry Cleaning Solvent (Perchloroethylene)', category: 'CHEMICAL', unit: 'liters', stock: 50, reorder: 20, cost: 35000, supplier: 'Industrial Chemicals Ltd', notes: 'Main dry cleaning chemical' },
      { name: 'Spot Cleaning Fluid', category: 'CHEMICAL', unit: 'liters', stock: 10, reorder: 5, cost: 12000, supplier: 'Pro Clean Supplies', notes: 'Pre-treatment' },
      { name: 'Starch Spray', category: 'CHEMICAL', unit: 'liters', stock: 15, reorder: 5, cost: 6000, supplier: 'Local Supermarket', notes: 'For crisp finish' },
      { name: 'Ironing Water (Scented)', category: 'CHEMICAL', unit: 'liters', stock: 20, reorder: 8, cost: 3500, supplier: 'Local Supplier', notes: 'Pleasant fragrance' },
      
      // PACKAGING MATERIALS
      { name: 'Plastic Garment Bags (Small)', category: 'PACKAGING', unit: 'pieces', stock: 1000, reorder: 300, cost: 250, supplier: 'Packaging Solutions Ltd', notes: 'For shirts/blouses' },
      { name: 'Plastic Garment Bags (Large)', category: 'PACKAGING', unit: 'pieces', stock: 800, reorder: 250, cost: 400, supplier: 'Packaging Solutions Ltd', notes: 'For suits/dresses' },
      { name: 'Suit Covers', category: 'PACKAGING', unit: 'pieces', stock: 500, reorder: 150, cost: 500, supplier: 'Packaging Solutions Ltd', notes: 'Premium suit packaging' },
      { name: 'Laundry Bags (Canvas)', category: 'PACKAGING', unit: 'pieces', stock: 200, reorder: 50, cost: 3500, supplier: 'Textile Supplies Uganda', notes: 'Reusable collection bags' },
      { name: 'Plastic Poly Bags (Roll)', category: 'PACKAGING', unit: 'rolls', stock: 50, reorder: 15, cost: 25000, supplier: 'Packaging Solutions Ltd', notes: '1000 bags per roll' },
      { name: 'Tissue Paper', category: 'PACKAGING', unit: 'reams', stock: 30, reorder: 10, cost: 8000, supplier: 'Office Supplies Uganda', notes: 'For folding clothes' },
      
      // HANGERS
      { name: 'Plastic Hangers (Standard)', category: 'HANGER', unit: 'pieces', stock: 500, reorder: 200, cost: 500, supplier: 'Hanger World Uganda', notes: 'Multi-purpose' },
      { name: 'Wooden Hangers (Premium)', category: 'HANGER', unit: 'pieces', stock: 200, reorder: 50, cost: 2000, supplier: 'Premium Supplies Ltd', notes: 'For suits' },
      { name: 'Wire Hangers', category: 'HANGER', unit: 'pieces', stock: 1000, reorder: 300, cost: 200, supplier: 'Hanger World Uganda', notes: 'Economy option' },
      { name: 'Clip Hangers (Trouser/Skirt)', category: 'HANGER', unit: 'pieces', stock: 300, reorder: 100, cost: 800, supplier: 'Hanger World Uganda', notes: 'For pants/skirts' },
      { name: 'Children Hangers', category: 'HANGER', unit: 'pieces', stock: 200, reorder: 80, cost: 400, supplier: 'Hanger World Uganda', notes: 'Small size' },
      
      // ACCESSORIES & SUPPLIES
      { name: 'Clothing Tags (Printed)', category: 'ACCESSORY', unit: 'pieces', stock: 5000, reorder: 1000, cost: 50, supplier: 'Print Masters Uganda', notes: 'With logo' },
      { name: 'Safety Pins (Box)', category: 'ACCESSORY', unit: 'boxes', stock: 50, reorder: 15, cost: 3000, supplier: 'General Supplies', notes: '1000 pins per box' },
      { name: 'Rubber Bands', category: 'ACCESSORY', unit: 'kg', stock: 5, reorder: 2, cost: 8000, supplier: 'Office Supplies Uganda', notes: 'For bundling' },
      { name: 'Marking Pens (Laundry)', category: 'ACCESSORY', unit: 'pieces', stock: 100, reorder: 30, cost: 1500, supplier: 'Office Supplies Uganda', notes: 'For labeling' },
      { name: 'Cleaning Brushes (Set)', category: 'ACCESSORY', unit: 'sets', stock: 20, reorder: 5, cost: 12000, supplier: 'Pro Clean Supplies', notes: 'Various sizes' },
      { name: 'Lint Rollers', category: 'ACCESSORY', unit: 'pieces', stock: 50, reorder: 15, cost: 5000, supplier: 'Pro Clean Supplies', notes: 'For finishing' },
      { name: 'Measuring Tape', category: 'ACCESSORY', unit: 'pieces', stock: 10, reorder: 3, cost: 3000, supplier: 'General Supplies', notes: 'For alterations' },
      
      // EQUIPMENT (High-value items tracked in inventory)
      { name: 'Industrial Washing Machine (10kg)', category: 'EQUIPMENT', unit: 'units', stock: 3, reorder: 1, cost: 8500000, supplier: 'Industrial Equipment Ltd', notes: 'Main washing machines' },
      { name: 'Industrial Dryer (10kg)', category: 'EQUIPMENT', unit: 'units', stock: 2, reorder: 1, cost: 6500000, supplier: 'Industrial Equipment Ltd', notes: 'Tumble dryers' },
      { name: 'Dry Cleaning Machine', category: 'EQUIPMENT', unit: 'units', stock: 1, reorder: 0, cost: 45000000, supplier: 'Industrial Equipment Ltd', notes: 'Main dry cleaning unit' },
      { name: 'Steam Press Iron', category: 'EQUIPMENT', unit: 'units', stock: 5, reorder: 2, cost: 850000, supplier: 'Professional Supplies Ltd', notes: 'Heavy-duty ironing' },
      { name: 'Garment Steamer (Commercial)', category: 'EQUIPMENT', unit: 'units', stock: 3, reorder: 1, cost: 1200000, supplier: 'Professional Supplies Ltd', notes: 'For delicate items' },
      { name: 'Ironing Board (Industrial)', category: 'EQUIPMENT', unit: 'units', stock: 6, reorder: 2, cost: 350000, supplier: 'Professional Supplies Ltd', notes: 'Heavy-duty boards' },
      { name: 'Folding Table', category: 'EQUIPMENT', unit: 'units', stock: 4, reorder: 1, cost: 450000, supplier: 'Furniture Depot Uganda', notes: 'For folding clothes' },
      { name: 'Garment Rack (Rolling)', category: 'EQUIPMENT', unit: 'units', stock: 8, reorder: 2, cost: 180000, supplier: 'Professional Supplies Ltd', notes: 'For storage/display' },
      { name: 'Water Filtration System', category: 'EQUIPMENT', unit: 'units', stock: 1, reorder: 0, cost: 3500000, supplier: 'Water Solutions Uganda', notes: 'Softens water' },
      
      // MAINTENANCE & SPARE PARTS
      { name: 'Machine Belts (Spare)', category: 'ACCESSORY', unit: 'pieces', stock: 10, reorder: 3, cost: 85000, supplier: 'Industrial Equipment Ltd', notes: 'For washing machines' },
      { name: 'Water Filters (Replacement)', category: 'ACCESSORY', unit: 'pieces', stock: 6, reorder: 2, cost: 120000, supplier: 'Water Solutions Uganda', notes: '6-month lifespan' },
      { name: 'Dryer Lint Screens', category: 'ACCESSORY', unit: 'pieces', stock: 8, reorder: 3, cost: 45000, supplier: 'Industrial Equipment Ltd', notes: 'Replacement screens' },
    ];
    
    // Insert inventory items
    for (const item of inventoryItems) {
      await client.query(`
        INSERT INTO inventory_items 
        (name, category, unit, quantity_in_stock, reorder_level, unit_cost, supplier, notes, last_restock_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, [item.name, item.category, item.unit, item.stock, item.reorder, item.cost, item.supplier, item.notes]);
    }
    
    await client.query('COMMIT');
    
    console.log(`✅ Successfully added ${inventoryItems.length} inventory items!\n`);
    console.log('📊 Inventory breakdown:');
    console.log(`   - Detergents: 5 items`);
    console.log(`   - Chemicals: 7 items`);
    console.log(`   - Packaging: 6 items`);
    console.log(`   - Hangers: 5 items`);
    console.log(`   - Accessories: 11 items`);
    console.log(`   - Equipment: 9 items`);
    console.log(`   - Spare Parts: 3 items`);
    console.log(`   TOTAL: ${inventoryItems.length} items\n`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

runMigration()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
