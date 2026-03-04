import pool from '../config/database.js';

const seedInventory = async () => {
  const client = await pool.connect();
  
  try {
    console.log('\n🏭 Seeding Inventory Items (Laundry Equipment & Supplies)...\n');
    
    await client.query('BEGIN');
    
    // Define realistic laundry business inventory
    const inventoryItems = [
      // MACHINERY & EQUIPMENT
      { name: 'Industrial Washing Machine (20kg)', description: 'Commercial washing machine - 20kg capacity', currentStock: 3, minStockLevel: 2, unitCost: 25000000, unit: 'units' },
      { name: 'Industrial Washing Machine (15kg)', description: 'Commercial washing machine - 15kg capacity', currentStock: 2, minStockLevel: 1, unitCost: 18000000, unit: 'units' },
      { name: 'Industrial Dryer (20kg)', description: 'Commercial dryer - 20kg capacity', currentStock: 2, minStockLevel: 1, unitCost: 15000000, unit: 'units' },
      { name: 'Steam Iron (Commercial)', description: 'Commercial steam iron for pressing', currentStock: 5, minStockLevel: 3, unitCost: 800000, unit: 'units' },
      { name: 'Pressing Table (Industrial)', description: 'Industrial pressing table', currentStock: 4, minStockLevel: 2, unitCost: 1200000, unit: 'units' },
      { name: 'Garment Steamer (Professional)', description: 'Professional garment steamer', currentStock: 3, minStockLevel: 2, unitCost: 650000, unit: 'units' },
      
      // DETERGENTS & CHEMICALS
      { name: 'Industrial Detergent Powder (25kg)', description: 'Heavy-duty laundry detergent powder', currentStock: 150, minStockLevel: 50, unitCost: 180000, unit: 'bags' },
      { name: 'Liquid Detergent (20L)', description: 'Commercial liquid laundry detergent', currentStock: 80, minStockLevel: 30, unitCost: 120000, unit: 'jerry cans' },
      { name: 'Fabric Softener (20L)', description: 'Commercial fabric softener', currentStock: 60, minStockLevel: 25, unitCost: 95000, unit: 'jerry cans' },
      { name: 'Bleach (Sodium Hypochlorite 5L)', description: 'Industrial bleach for white fabrics', currentStock: 45, minStockLevel: 20, unitCost: 25000, unit: 'bottles' },
      { name: 'Stain Remover (5L)', description: 'Commercial stain remover', currentStock: 35, minStockLevel: 15, unitCost: 45000, unit: 'bottles' },
      { name: 'Disinfectant (5L)', description: 'Industrial disinfectant', currentStock: 40, minStockLevel: 20, unitCost: 35000, unit: 'bottles' },
      { name: 'Ironing Starch Spray (500ml)', description: 'Starch spray for crisp finish', currentStock: 120, minStockLevel: 40, unitCost: 8000, unit: 'bottles' },
      
      // PACKAGING MATERIALS
      { name: 'Plastic Garment Bags (Large)', description: 'Clear plastic bags for large garments', currentStock: 5000, minStockLevel: 1000, unitCost: 500, unit: 'pieces' },
      { name: 'Plastic Garment Bags (Medium)', description: 'Clear plastic bags for medium garments', currentStock: 3000, minStockLevel: 800, unitCost: 350, unit: 'pieces' },
      { name: 'Hangers (Plastic)', description: 'Plastic clothes hangers', currentStock: 8000, minStockLevel: 2000, unitCost: 300, unit: 'pieces' },
      { name: 'Hangers (Wire)', description: 'Wire clothes hangers', currentStock: 6000, minStockLevel: 1500, unitCost: 200, unit: 'pieces' },
      { name: 'Laundry Tags (Paper)', description: 'Paper tags for order tracking', currentStock: 15000, minStockLevel: 3000, unitCost: 50, unit: 'pieces' },
      { name: 'Receipt Books', description: 'Receipt books for cash transactions', currentStock: 50, minStockLevel: 15, unitCost: 12000, unit: 'books' },
      { name: 'Packaging Tape (Clear)', description: 'Clear packing tape', currentStock: 80, minStockLevel: 25, unitCost: 4000, unit: 'rolls' },
      
      // UTILITIES & CONSUMABLES
      { name: 'Water Treatment Tablets', description: 'Water softening tablets', currentStock: 200, minStockLevel: 50, unitCost: 2000, unit: 'tablets' },
      { name: 'Laundry Baskets (Large)', description: 'Large laundry sorting baskets', currentStock: 25, minStockLevel: 10, unitCost: 25000, unit: 'pieces' },
      { name: 'Sorting Bins (3-compartment)', description: '3-compartment sorting bins', currentStock: 10, minStockLevel: 5, unitCost: 85000, unit: 'units' },
      { name: 'Protective Gloves (Rubber)', description: 'Rubber gloves for staff protection', currentStock: 150, minStockLevel: 50, unitCost: 3000, unit: 'pairs' },
      { name: 'Face Masks (Disposable)', description: 'Disposable face masks', currentStock: 500, minStockLevel: 200, unitCost: 500, unit: 'pieces' },
      { name: 'Aprons (Waterproof)', description: 'Waterproof aprons for staff', currentStock: 30, minStockLevel: 15, unitCost: 15000, unit: 'pieces' },
      
      // SPARE PARTS
      { name: 'Washing Machine Belts', description: 'Replacement belts for washing machines', currentStock: 12, minStockLevel: 5, unitCost: 45000, unit: 'pieces' },
      { name: 'Dryer Heating Elements', description: 'Replacement heating elements for dryers', currentStock: 6, minStockLevel: 3, unitCost: 320000, unit: 'pieces' },
      { name: 'Water Inlet Valves', description: 'Water inlet valves for machines', currentStock: 10, minStockLevel: 4, unitCost: 65000, unit: 'pieces' },
      { name: 'Steam Iron Soleplate', description: 'Replacement soleplate for steam irons', currentStock: 8, minStockLevel: 3, unitCost: 120000, unit: 'pieces' },
    ];
    
    let inserted = 0;
    let skipped = 0;
    
    for (const item of inventoryItems) {
      // Check if item already exists
      const existingItem = await client.query(
        'SELECT id FROM inventory_items WHERE name = $1',
        [item.name]
      );
      
      if (existingItem.rows.length > 0) {
        console.log(`⏭️  Skipped: ${item.name} (already exists)`);
        skipped++;
        continue;
      }
      
      // Insert new item
      await client.query(
        `INSERT INTO inventory_items (
          name, description, current_stock, min_stock_level, 
          unit_price, unit
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          item.name,
          item.description,
          item.currentStock,
          item.minStockLevel,
          item.unitCost,
          item.unit
        ]
      );
      
      console.log(`✅ Added: ${item.name} (${item.currentStock} ${item.unit})`);
      inserted++;
    }
    
    await client.query('COMMIT');
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📦 INVENTORY SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Added:   ${inserted} items`);
    console.log(`   Skipped: ${skipped} items (already exist)`);
    console.log(`   Total:   ${inserted + skipped} items processed`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Show total inventory value
    const totalValue = await client.query(`
      SELECT 
        COUNT(*) as item_count,
        SUM(current_stock) as total_stock,
        SUM(current_stock * unit_price) as total_value
      FROM inventory_items
    `);
    
    console.log('📊 INVENTORY SUMMARY:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Items: ${totalValue.rows[0].item_count}`);
    console.log(`Total Stock Units: ${parseFloat(totalValue.rows[0].total_stock).toLocaleString()}`);
    console.log(`Total Inventory Value: UGX ${parseFloat(totalValue.rows[0].total_value).toLocaleString()}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Show low stock items (below minimum level)
    const lowStock = await client.query(`
      SELECT name, current_stock, min_stock_level, unit
      FROM inventory_items
      WHERE current_stock < min_stock_level
      ORDER BY (current_stock / NULLIF(min_stock_level, 1))
    `);
    
    if (lowStock.rows.length > 0) {
      console.log('⚠️  LOW STOCK ALERTS:');
      console.log('═══════════════════════════════════════════════════════════');
      lowStock.rows.forEach((item) => {
        console.log(`   ${item.name}: ${item.current_stock} ${item.unit} (min: ${item.min_stock_level})`);
      });
      console.log('═══════════════════════════════════════════════════════════\n');
    } else {
      console.log('✅ All items are adequately stocked\n');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Inventory seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedInventory();
