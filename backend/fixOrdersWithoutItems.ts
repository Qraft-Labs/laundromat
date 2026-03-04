import { query, getClient } from './src/config/database';

async function fixOrdersWithoutItems() {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Get all orders without items
    const ordersResult = await client.query(
      `SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.customer_id
       FROM orders o
       WHERE o.total_amount > 0
       AND (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) = 0
       ORDER BY o.created_at`
    );
    
    console.log(`\n📊 Found ${ordersResult.rows.length} orders without items\n`);
    
    // Get available price items to use
    const priceItemsResult = await client.query(
      `SELECT id, name, price, category 
       FROM price_items 
       WHERE is_active = TRUE 
       ORDER BY price`
    );
    
    const priceItems = priceItemsResult.rows;
    console.log(`💰 Available price items: ${priceItems.length}\n`);
    
    let fixedCount = 0;
    
    for (const order of ordersResult.rows) {
      const totalAmount = parseFloat(order.total_amount);
      const orderId = order.id;
      
      console.log(`\n🔧 Fixing ${order.order_number} (USh ${totalAmount.toLocaleString()})`);
      
      // Strategy: Add 2-4 items that approximately total to the order amount
      const itemsToAdd: any[] = [];
      let runningTotal = 0;
      const targetItems = Math.floor(Math.random() * 3) + 2; // 2-4 items
      const perItemBudget = totalAmount / targetItems;
      
      // Find items close to the per-item budget
      for (let i = 0; i < targetItems; i++) {
        // Find an item close to the remaining amount needed
        const remaining = totalAmount - runningTotal;
        const targetPrice = i === targetItems - 1 ? remaining : perItemBudget;
        
        // Find closest priced item
        let selectedItem = priceItems[0];
        let closestDiff = Math.abs(parseFloat(priceItems[0].price) - targetPrice);
        
        for (const item of priceItems) {
          const itemPrice = parseFloat(item.price);
          const diff = Math.abs(itemPrice - targetPrice);
          if (diff < closestDiff) {
            closestDiff = diff;
            selectedItem = item;
          }
        }
        
        const itemPrice = parseFloat(selectedItem.price);
        const quantity = i === targetItems - 1 
          ? Math.max(1, Math.round(remaining / itemPrice))
          : Math.max(1, Math.round(targetPrice / itemPrice));
        
        const itemTotal = itemPrice * quantity;
        
        itemsToAdd.push({
          priceItemId: selectedItem.id,
          name: selectedItem.name,
          serviceType: 'wash', // Valid service type
          quantity: quantity,
          unitPrice: itemPrice,
          totalPrice: itemTotal
        });
        
        runningTotal += itemTotal;
      }
      
      // Adjust last item quantity to match exact total
      if (itemsToAdd.length > 0) {
        const lastItem = itemsToAdd[itemsToAdd.length - 1];
        const diff = totalAmount - runningTotal;
        
        if (Math.abs(diff) > 0.01) {
          // Adjust quantity of last item
          const newQuantity = Math.max(1, Math.round((lastItem.totalPrice + diff) / lastItem.unitPrice));
          lastItem.quantity = newQuantity;
          lastItem.totalPrice = lastItem.unitPrice * newQuantity;
        }
      }
      
      // Insert order items
      console.log(`  Adding ${itemsToAdd.length} items:`);
      for (const item of itemsToAdd) {
        await client.query(
          `INSERT INTO order_items (
            order_id,
            price_item_id,
            service_type,
            quantity,
            unit_price,
            total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.priceItemId, item.serviceType, item.quantity, item.unitPrice, item.totalPrice]
        );
        
        console.log(`    • ${item.quantity}x ${item.name} @ USh ${item.unitPrice.toLocaleString()} = USh ${item.totalPrice.toLocaleString()}`);
      }
      
      const finalTotal = itemsToAdd.reduce((sum, item) => sum + item.totalPrice, 0);
      console.log(`  ✅ Total: USh ${finalTotal.toLocaleString()} (Target: USh ${totalAmount.toLocaleString()})`);
      
      fixedCount++;
    }
    
    await client.query('COMMIT');
    client.release();
    
    console.log(`\n\n✅ Successfully fixed ${fixedCount} orders!`);
    process.exit(0);
    
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOrdersWithoutItems();
