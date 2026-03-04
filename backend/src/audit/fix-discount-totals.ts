import { query } from '../config/database';

async function fixDiscountTotals() {
  try {
    console.log('\n🔧 FIXING DISCOUNT TOTALS\n');
    console.log('═'.repeat(70));
    
    // Find orders where discount exists but total doesn't reflect it
    const brokenOrders = await query(`
      SELECT 
        id,
        order_number,
        subtotal,
        discount_amount,
        total_amount,
        amount_paid,
        balance
      FROM orders
      WHERE discount_amount > 0
        AND total_amount = subtotal
      ORDER BY discount_amount DESC
    `);
    
    console.log(`Found ${brokenOrders.rows.length} orders with discount not applied to total\n`);
    
    if (brokenOrders.rows.length === 0) {
      console.log('✅ All discount calculations are correct!\n');
      process.exit(0);
    }
    
    console.log('Sample of orders to fix:');
    console.log('─'.repeat(70));
    brokenOrders.rows.slice(0, 5).forEach((order, i) => {
      const correctTotal = order.subtotal - order.discount_amount;
      console.log(`${i + 1}. ${order.order_number}`);
      console.log(`   Subtotal: UGX ${order.subtotal.toLocaleString('en-UG')}`);
      console.log(`   Discount: UGX ${order.discount_amount.toLocaleString('en-UG')}`);
      console.log(`   Current Total: UGX ${order.total_amount.toLocaleString('en-UG')} ❌`);
      console.log(`   Should be: UGX ${correctTotal.toLocaleString('en-UG')} ✅`);
      console.log();
    });
    
    console.log('─'.repeat(70));
    console.log('🔄 Applying fixes...\n');
    
    let fixed = 0;
    for (const order of brokenOrders.rows) {
      const correctTotal = order.subtotal - order.discount_amount;
      const correctBalance = correctTotal - order.amount_paid;
      
      // Determine payment status
      let paymentStatus: string;
      if (correctBalance <= 0) {
        paymentStatus = 'PAID';
      } else if (order.amount_paid === 0) {
        paymentStatus = 'UNPAID';
      } else {
        paymentStatus = 'PARTIAL';
      }
      
      await query(
        `UPDATE orders 
         SET total_amount = $1, 
             balance = $2,
             payment_status = $3
         WHERE id = $4`,
        [correctTotal, correctBalance, paymentStatus, order.id]
      );
      
      fixed++;
      
      if (fixed % 50 === 0) {
        console.log(`   Fixed ${fixed} orders...`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} orders!\n`);
    
    // Verify the fixes
    console.log('─'.repeat(70));
    console.log('🔍 VERIFICATION:\n');
    
    const verify = await query(`
      SELECT 
        COUNT(*) as broken_count
      FROM orders
      WHERE discount_amount > 0
        AND total_amount != (subtotal - discount_amount)
    `);
    
    const stillBroken = parseInt(verify.rows[0].broken_count);
    
    if (stillBroken === 0) {
      console.log('✅ All discount calculations now correct!');
      console.log('✅ All orders: total = subtotal - discount');
      console.log('✅ All balances recalculated');
      console.log('✅ All payment statuses updated');
      
      // Show sample fixed orders
      console.log('\n' + '─'.repeat(70));
      console.log('Sample of fixed orders:\n');
      
      const samples = await query(`
        SELECT 
          order_number,
          subtotal,
          discount_amount,
          total_amount,
          amount_paid,
          balance,
          payment_status
        FROM orders
        WHERE discount_amount > 0
        ORDER BY discount_amount DESC
        LIMIT 5
      `);
      
      samples.rows.forEach((order, i) => {
        const calcCorrect = (order.total_amount === order.subtotal - order.discount_amount);
        console.log(`${i + 1}. ${order.order_number} ${calcCorrect ? '✅' : '❌'}`);
        console.log(`   Subtotal:     UGX ${order.subtotal.toLocaleString('en-UG')}`);
        console.log(`   Discount:     UGX ${order.discount_amount.toLocaleString('en-UG')}`);
        console.log(`   Total:        UGX ${order.total_amount.toLocaleString('en-UG')}`);
        console.log(`   Paid:         UGX ${order.amount_paid.toLocaleString('en-UG')}`);
        console.log(`   Balance:      UGX ${order.balance.toLocaleString('en-UG')}`);
        console.log(`   Status:       ${order.payment_status}`);
        console.log(`   Calculation:  ${order.subtotal.toLocaleString('en-UG')} - ${order.discount_amount.toLocaleString('en-UG')} = ${order.total_amount.toLocaleString('en-UG')} ✅`);
        console.log();
      });
      
    } else {
      console.log(`❌ Still ${stillBroken} orders with incorrect totals`);
    }
    
    console.log('═'.repeat(70) + '\n');
    
    process.exit(stillBroken === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDiscountTotals();
