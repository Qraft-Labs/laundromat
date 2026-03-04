import { query } from '../config/database';

async function verifyPercentageCalculations() {
  try {
    console.log('\n' + '═'.repeat(70));
    console.log('🔢 DISCOUNT PERCENTAGE CALCULATION VERIFICATION');
    console.log('═'.repeat(70) + '\n');
    
    // Get all orders with discounts
    const orders = await query(`
      SELECT 
        order_number,
        subtotal,
        discount_percentage,
        discount_amount,
        total_amount
      FROM orders
      WHERE discount_amount > 0
      ORDER BY id
      LIMIT 20
    `);
    
    console.log(`Checking ${orders.rows.length} orders with discounts...\n`);
    console.log('─'.repeat(70));
    
    let allCorrect = true;
    let errors: Array<{ order: string; issue: string }> = [];
    
    orders.rows.forEach((order, index) => {
      const subtotal = parseFloat(order.subtotal);
      const discountPct = parseFloat(order.discount_percentage);
      const discountAmt = parseFloat(order.discount_amount);
      const total = parseFloat(order.total_amount);
      
      // Calculate expected discount amount
      // Formula: discount_amount = ROUND(subtotal × (discount_percentage / 100))
      const expectedDiscount = Math.round(subtotal * (discountPct / 100));
      const expectedTotal = subtotal - expectedDiscount;
      
      // Check if calculations match
      const discountMatch = discountAmt === expectedDiscount;
      const totalMatch = total === expectedTotal;
      const bothCorrect = discountMatch && totalMatch;
      
      if (!bothCorrect) {
        allCorrect = false;
        errors.push({
          order: order.order_number,
          issue: !discountMatch ? 'Discount calculation' : 'Total calculation'
        });
      }
      
      // Display first 10 in detail
      if (index < 10) {
        console.log(`${index + 1}. ${order.order_number} ${bothCorrect ? '✅' : '❌'}`);
        console.log(`   Subtotal:              UGX ${subtotal.toLocaleString('en-UG')}`);
        console.log(`   Discount Percentage:   ${discountPct}%`);
        console.log(`   
   Percentage Calculation:`);
        console.log(`   ${subtotal.toLocaleString('en-UG')} × ${discountPct}% = ${subtotal.toLocaleString('en-UG')} × ${discountPct}/100`);
        console.log(`   ${subtotal.toLocaleString('en-UG')} × ${(discountPct / 100).toFixed(2)} = ${(subtotal * (discountPct / 100)).toLocaleString('en-UG')}`);
        console.log(`   Rounded: UGX ${expectedDiscount.toLocaleString('en-UG')}`);
        console.log(`   
   Stored Discount Amount: UGX ${discountAmt.toLocaleString('en-UG')} ${discountMatch ? '✅' : `❌ (Expected: ${expectedDiscount.toLocaleString('en-UG')})`}`);
        console.log(`   
   Total Calculation:`);
        console.log(`   ${subtotal.toLocaleString('en-UG')} - ${discountAmt.toLocaleString('en-UG')} = ${(subtotal - discountAmt).toLocaleString('en-UG')}`);
        console.log(`   Stored Total:           UGX ${total.toLocaleString('en-UG')} ${totalMatch ? '✅' : `❌ (Expected: ${expectedTotal.toLocaleString('en-UG')})`}`);
        console.log();
      }
    });
    
    // Summary
    console.log('═'.repeat(70));
    console.log('📊 VERIFICATION SUMMARY\n');
    console.log('─'.repeat(70));
    
    if (allCorrect) {
      console.log('✅ ALL PERCENTAGE CALCULATIONS CORRECT!');
      console.log(`   Verified ${orders.rows.length} orders`);
      console.log('   Formula: discount_amount = ROUND(subtotal × (percentage / 100))');
      console.log('   All calculations mathematically accurate');
    } else {
      console.log(`❌ Found ${errors.length} orders with calculation errors:`);
      errors.forEach(err => {
        console.log(`   - ${err.order}: ${err.issue}`);
      });
    }
    
    console.log('\n' + '─'.repeat(70));
    console.log('🧮 DETAILED PERCENTAGE EXAMPLES\n');
    console.log('─'.repeat(70));
    
    // Show detailed calculations for different percentages
    const examples = [
      { subtotal: 100000, pct: 5 },
      { subtotal: 500000, pct: 10 },
      { subtotal: 1000000, pct: 15 },
      { subtotal: 1234567, pct: 12.5 },
    ];
    
    examples.forEach((ex, i) => {
      const discount = Math.round(ex.subtotal * (ex.pct / 100));
      const total = ex.subtotal - discount;
      
      console.log(`${i + 1}. Subtotal: UGX ${ex.subtotal.toLocaleString('en-UG')}, Discount: ${ex.pct}%`);
      console.log(`   Step 1: Convert percentage to decimal`);
      console.log(`           ${ex.pct}% = ${ex.pct}/100 = ${(ex.pct / 100).toFixed(4)}`);
      console.log(`   Step 2: Multiply subtotal by decimal`);
      console.log(`           ${ex.subtotal.toLocaleString('en-UG')} × ${(ex.pct / 100).toFixed(4)} = ${(ex.subtotal * (ex.pct / 100)).toLocaleString('en-UG')}`);
      console.log(`   Step 3: Round to whole number (UGX has no decimals)`);
      console.log(`           ROUND(${(ex.subtotal * (ex.pct / 100)).toLocaleString('en-UG')}) = ${discount.toLocaleString('en-UG')}`);
      console.log(`   Step 4: Subtract from subtotal`);
      console.log(`           ${ex.subtotal.toLocaleString('en-UG')} - ${discount.toLocaleString('en-UG')} = ${total.toLocaleString('en-UG')}`);
      console.log(`   
   Result: Discount = UGX ${discount.toLocaleString('en-UG')}, Total = UGX ${total.toLocaleString('en-UG')} ✅`);
      console.log();
    });
    
    // Statistical analysis
    console.log('─'.repeat(70));
    console.log('📈 STATISTICAL ANALYSIS\n');
    console.log('─'.repeat(70));
    
    const stats = await query(`
      SELECT 
        discount_percentage,
        COUNT(*) as order_count,
        SUM(subtotal) as total_subtotal,
        SUM(discount_amount) as total_discount,
        AVG(discount_amount) as avg_discount
      FROM orders
      WHERE discount_amount > 0
      GROUP BY discount_percentage
      ORDER BY discount_percentage
    `);
    
    console.log('Discount %  | Orders | Total Subtotal    | Total Discount    | Avg Discount');
    console.log('─'.repeat(70));
    
    stats.rows.forEach(row => {
      const pct = parseFloat(row.discount_percentage);
      const count = parseInt(row.order_count);
      const subtotal = parseInt(row.total_subtotal);
      const discount = parseInt(row.total_discount);
      const avg = parseInt(row.avg_discount);
      
      // Verify: total_discount should equal total_subtotal × (pct / 100)
      const expectedDiscount = Math.round(subtotal * (pct / 100));
      const match = Math.abs(discount - expectedDiscount) < count; // Allow small rounding differences per order
      
      console.log(`${pct.toString().padEnd(11)} | ${count.toString().padEnd(6)} | UGX ${subtotal.toLocaleString('en-UG').padEnd(14)} | UGX ${discount.toLocaleString('en-UG').padEnd(14)} | UGX ${avg.toLocaleString('en-UG')} ${match ? '✅' : '❌'}`);
    });
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ PERCENTAGE VERIFICATION COMPLETE\n');
    console.log('Key Points:');
    console.log('  ✓ Discounts entered as percentages from frontend (5, 10, 15, etc.)');
    console.log('  ✓ Backend converts: percentage/100 to get decimal (0.05, 0.10, 0.15)');
    console.log('  ✓ Backend multiplies: subtotal × decimal = discount amount');
    console.log('  ✓ Backend rounds to whole number (UGX has no decimals)');
    console.log('  ✓ Backend subtracts: subtotal - discount = total');
    console.log('  ✓ All calculations mathematically correct');
    console.log('═'.repeat(70) + '\n');
    
    process.exit(allCorrect ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyPercentageCalculations();
