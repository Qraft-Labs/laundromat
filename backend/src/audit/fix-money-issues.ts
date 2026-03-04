import { query } from '../config/database';

async function fixIssues() {
  try {
    console.log('🔧 FIXING MONEY FORMATTING ISSUES\n');
    console.log('═'.repeat(70) + '\n');
    
    // Issue 1: Fix the one order with wrong total
    console.log('📋 1. Fixing Order ORD20260135');
    console.log('─'.repeat(70));
    
    const orderResult = await query(
      `SELECT id, order_number, subtotal, discount_amount, total_amount 
       FROM orders 
       WHERE order_number = $1`,
      ['ORD20260135']
    );
    
    if (orderResult.rows.length > 0) {
      const order = orderResult.rows[0];
      const correctTotal = order.subtotal - order.discount_amount;
      const correctBalance = correctTotal - 0; // amount_paid is 0
      
      console.log(`   Current Total: UGX ${order.total_amount.toLocaleString('en-UG')}`);
      console.log(`   Should be: UGX ${correctTotal.toLocaleString('en-UG')}`);
      console.log(`   Difference: UGX ${(order.total_amount - correctTotal).toLocaleString('en-UG')}`);
      
      await query(
        `UPDATE orders 
         SET total_amount = $1, balance = $2
         WHERE id = $3`,
        [correctTotal, correctBalance, order.id]
      );
      
      console.log(`   ✅ Fixed: Total updated to UGX ${correctTotal.toLocaleString('en-UG')}\n`);
    }
    
    // Issue 2: Fix payments table amount field to be integer
    console.log('📋 2. Fixing Payments Table Amount Field');
    console.log('─'.repeat(70));
    
    // Check current type
    const schemaCheck = await query(
      `SELECT column_name, data_type, numeric_precision, numeric_scale
       FROM information_schema.columns
       WHERE table_name = 'payments' AND column_name = 'amount'`
    );
    
    if (schemaCheck.rows.length > 0) {
      const col = schemaCheck.rows[0];
      console.log(`   Current type: ${col.data_type}`);
      
      if (col.data_type === 'numeric') {
        // Check if there are any decimal values
        const decimalCheck = await query(
          `SELECT COUNT(*) as count
           FROM payments
           WHERE amount::numeric % 1 != 0`
        );
        
        const decimalCount = parseInt(decimalCheck.rows[0].count);
        console.log(`   Decimal values found: ${decimalCount}`);
        
        if (decimalCount === 0) {
          console.log(`   Converting to INTEGER type...`);
          
          await query('ALTER TABLE payments ALTER COLUMN amount TYPE integer USING amount::integer');
          
          console.log(`   ✅ Fixed: Amount column now INTEGER\n`);
        } else {
          console.log(`   ⚠️  Warning: ${decimalCount} decimal values found - rounding first...`);
          
          await query('UPDATE payments SET amount = ROUND(amount)');
          await query('ALTER TABLE payments ALTER COLUMN amount TYPE integer USING amount::integer');
          
          console.log(`   ✅ Fixed: Rounded and converted to INTEGER\n`);
        }
      } else {
        console.log(`   ✅ Already INTEGER - no fix needed\n`);
      }
    }
    
    console.log('═'.repeat(70));
    console.log('✅ ALL FIXES COMPLETE!\n');
    
    // Verify
    console.log('🔍 VERIFICATION:');
    console.log('─'.repeat(70));
    
    const verify1 = await query(
      `SELECT order_number, subtotal, discount_amount, total_amount
       FROM orders
       WHERE order_number = 'ORD20260135'`
    );
    
    const order = verify1.rows[0];
    const expectedTotal = order.subtotal - order.discount_amount;
    console.log(`Order ORD20260135: ${order.total_amount === expectedTotal ? '✅ CORRECT' : '❌ STILL WRONG'}`);
    
    const verify2 = await query(
      `SELECT data_type
       FROM information_schema.columns
       WHERE table_name = 'payments' AND column_name = 'amount'`
    );
    
    console.log(`Payments amount field: ${verify2.rows[0].data_type === 'integer' ? '✅ INTEGER' : '❌ NOT INTEGER'}`);
    
    console.log('\n' + '═'.repeat(70));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIssues();
