import { query } from '../config/database';

async function fixOrderTotals() {
  console.log('\n🔧 FIXING ORDER TOTAL CALCULATIONS\n');

  try {
    // Find all orders with incorrect totals
    const incorrectOrders = await query(`
      SELECT 
        id,
        order_number,
        subtotal,
        discount,
        total_amount as current_total,
        (subtotal - discount) as correct_total,
        amount_paid,
        balance as current_balance
      FROM orders
      WHERE ABS(total_amount - (subtotal - discount)) > 0.01
      ORDER BY id
    `);

    console.log(`Found ${incorrectOrders.rows.length} orders with incorrect totals\n`);

    if (incorrectOrders.rows.length === 0) {
      console.log('✅ All orders already have correct totals!');
      process.exit(0);
    }

    // Display sample of issues
    console.log('Sample of affected orders:');
    incorrectOrders.rows.slice(0, 5).forEach((row: any) => {
      console.log(`  ${row.order_number}: Current=${row.current_total}, Should be=${row.correct_total}`);
    });

    console.log('\n⚠️  This script will:');
    console.log('  1. Recalculate total_amount = subtotal - discount');
    console.log('  2. Recalculate balance = total_amount - amount_paid');
    console.log('  3. Update payment_status based on new balance');
    console.log('\n❓ Proceed with fix? (This will modify the database)');
    console.log('   Run with FIX=yes environment variable to execute\n');

    if (process.env.FIX !== 'yes') {
      console.log('⏸️  Dry run mode. Set FIX=yes to apply changes.');
      process.exit(0);
    }

    console.log('🔄 Applying fixes...\n');

    let fixed = 0;
    for (const order of incorrectOrders.rows) {
      const correctTotal = order.correct_total;
      const newBalance = correctTotal - order.amount_paid;
      let newStatus = 'UNPAID';
      
      if (newBalance <= 0) {
        newStatus = 'PAID';
      } else if (order.amount_paid > 0) {
        newStatus = 'PARTIAL';
      }

      await query(`
        UPDATE orders
        SET 
          total_amount = $1,
          balance = $2,
          payment_status = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [correctTotal, newBalance, newStatus, order.id]);

      fixed++;
      if (fixed % 50 === 0) {
        console.log(`  ✓ Fixed ${fixed}/${incorrectOrders.rows.length} orders...`);
      }
    }

    console.log(`\n✅ Fixed ${fixed} orders successfully!\n`);

    // Verify fix
    const remaining = await query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE ABS(total_amount - (subtotal - discount)) > 0.01
    `);

    if (parseInt(remaining.rows[0].count) === 0) {
      console.log('✅ Verification passed: All totals now correct!');
    } else {
      console.log(`⚠️  Warning: ${remaining.rows[0].count} orders still have issues`);
    }

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixOrderTotals();
