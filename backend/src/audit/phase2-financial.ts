import { query } from '../config/database';

async function phase2FinancialAudit() {
  console.log('\n' + '='.repeat(80));
  console.log('💰 PHASE 2: FINANCIAL CALCULATIONS & MONEY ACCURACY AUDIT');
  console.log('='.repeat(80) + '\n');

  const results = {
    passed: [] as string[],
    failed: [] as string[],
    warnings: [] as string[],
  };

  try {
    // ============================================================
    // 2.1 VERIFY ORDER SUBTOTAL CALCULATIONS
    // ============================================================
    console.log('📋 2.1 CHECKING ORDER SUBTOTAL CALCULATIONS\n');

    const subtotalCheck = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.subtotal as stored_subtotal,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as calculated_subtotal,
        ABS(o.subtotal - COALESCE(SUM(oi.quantity * oi.unit_price), 0)) as difference
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, o.order_number, o.subtotal
      HAVING ABS(o.subtotal - COALESCE(SUM(oi.quantity * oi.unit_price), 0)) > 0.01
      ORDER BY difference DESC
      LIMIT 10
    `);

    if (subtotalCheck.rows.length === 0) {
      console.log('   ✅ All order subtotals match item calculations');
      results.passed.push('Order subtotals accurate');
    } else {
      console.log(`   ❌ Found ${subtotalCheck.rows.length} orders with incorrect subtotals:`);
      subtotalCheck.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Stored=${row.stored_subtotal}, Calculated=${row.calculated_subtotal}, Diff=${row.difference}`);
      });
      results.failed.push(`${subtotalCheck.rows.length} orders with incorrect subtotals`);
    }

    console.log('');

    // ============================================================
    // 2.2 VERIFY TOTAL AMOUNT CALCULATIONS
    // ============================================================
    console.log('📋 2.2 CHECKING TOTAL AMOUNT CALCULATIONS (subtotal - discount)\n');

    const totalCheck = await query(`
      SELECT 
        id,
        order_number,
        subtotal,
        discount_amount,
        total_amount as stored_total,
        (subtotal - discount_amount) as calculated_total,
        ABS(total_amount - (subtotal - discount_amount)) as difference
      FROM orders
      WHERE ABS(total_amount - (subtotal - discount_amount)) > 0.01
      LIMIT 10
    `);

    if (totalCheck.rows.length === 0) {
      console.log('   ✅ All total amounts correctly calculated (subtotal - discount_amount)');
      results.passed.push('Total amounts accurate');
    } else {
      console.log(`   ❌ Found ${totalCheck.rows.length} orders with incorrect totals:`);
      totalCheck.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Subtotal=${row.subtotal}, Discount=${row.discount_amount}, Stored=${row.stored_total}, Should be=${row.calculated_total}`);
      });
      results.failed.push(`${totalCheck.rows.length} orders with incorrect totals`);
    }

    console.log('');

    // ============================================================
    // 2.3 VERIFY BALANCE CALCULATIONS
    // ============================================================
    console.log('📋 2.3 CHECKING BALANCE CALCULATIONS (total - amount_paid)\n');

    const balanceCheck = await query(`
      SELECT 
        id,
        order_number,
        total_amount,
        amount_paid,
        balance as stored_balance,
        (total_amount - amount_paid) as calculated_balance,
        ABS(balance - (total_amount - amount_paid)) as difference
      FROM orders
      WHERE ABS(balance - (total_amount - amount_paid)) > 0.01
      LIMIT 10
    `);

    if (balanceCheck.rows.length === 0) {
      console.log('   ✅ All balances correctly calculated (total - paid)');
      results.passed.push('Balance calculations accurate');
    } else {
      console.log(`   ❌ Found ${balanceCheck.rows.length} orders with incorrect balances:`);
      balanceCheck.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Total=${row.total_amount}, Paid=${row.amount_paid}, Stored Balance=${row.stored_balance}, Should be=${row.calculated_balance}`);
      });
      results.failed.push(`${balanceCheck.rows.length} orders with incorrect balances`);
    }

    console.log('');

    // ============================================================
    // 2.4 VERIFY PAYMENT STATUS LOGIC
    // ============================================================
    console.log('📋 2.4 CHECKING PAYMENT STATUS LOGIC\n');

    // Check for PAID orders with balance > 0
    const wronglyPaid = await query(`
      SELECT id, order_number, total_amount, amount_paid, balance, payment_status
      FROM orders
      WHERE payment_status = 'PAID' AND balance > 0.01
      LIMIT 10
    `);

    if (wronglyPaid.rows.length === 0) {
      console.log('   ✅ No PAID orders with outstanding balance');
      results.passed.push('PAID status accurate');
    } else {
      console.log(`   ❌ Found ${wronglyPaid.rows.length} PAID orders with balance > 0:`);
      wronglyPaid.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Total=${row.total_amount}, Paid=${row.amount_paid}, Balance=${row.balance}`);
      });
      results.failed.push(`${wronglyPaid.rows.length} PAID orders have outstanding balance`);
    }

    // Check for UNPAID orders with payment > 0
    const wronglyUnpaid = await query(`
      SELECT id, order_number, total_amount, amount_paid, balance, payment_status
      FROM orders
      WHERE payment_status = 'UNPAID' AND amount_paid > 0.01
      LIMIT 10
    `);

    if (wronglyUnpaid.rows.length === 0) {
      console.log('   ✅ No UNPAID orders with payments received');
      results.passed.push('UNPAID status accurate');
    } else {
      console.log(`   ⚠️  Found ${wronglyUnpaid.rows.length} UNPAID orders with payments:`);
      wronglyUnpaid.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Paid=${row.amount_paid} (should be PARTIAL)`);
      });
      results.warnings.push(`${wronglyUnpaid.rows.length} UNPAID orders have payments (should be PARTIAL)`);
    }

    // Check for PARTIAL orders
    const partialOrders = await query(`
      SELECT id, order_number, total_amount, amount_paid, balance, payment_status
      FROM orders
      WHERE payment_status = 'PARTIAL' AND (amount_paid = 0 OR balance <= 0.01)
      LIMIT 10
    `);

    if (partialOrders.rows.length === 0) {
      console.log('   ✅ All PARTIAL orders have partial payments');
      results.passed.push('PARTIAL status accurate');
    } else {
      console.log(`   ⚠️  Found ${partialOrders.rows.length} PARTIAL orders incorrectly marked:`);
      partialOrders.rows.forEach((row: any) => {
        const correct = row.amount_paid === 0 ? 'UNPAID' : 'PAID';
        console.log(`      Order ${row.order_number}: Paid=${row.amount_paid}, Balance=${row.balance} (should be ${correct})`);
      });
      results.warnings.push(`${partialOrders.rows.length} PARTIAL orders incorrectly marked`);
    }

    console.log('');

    // ============================================================
    // 2.5 CHECK FOR NEGATIVE VALUES
    // ============================================================
    console.log('📋 2.5 CHECKING FOR NEGATIVE VALUES\n');

    const negativeValues = await query(`
      SELECT 
        id,
        order_number,
        CASE 
          WHEN subtotal < 0 THEN 'subtotal'
          WHEN discount < 0 THEN 'discount'
          WHEN total_amount < 0 THEN 'total_amount'
          WHEN amount_paid < 0 THEN 'amount_paid'
          WHEN balance < 0 THEN 'balance'
        END as negative_field,
        subtotal,
        discount,
        total_amount,
        amount_paid,
        balance
      FROM orders
      WHERE subtotal < 0 OR discount < 0 OR total_amount < 0 OR amount_paid < 0 OR balance < 0
      LIMIT 10
    `);

    if (negativeValues.rows.length === 0) {
      console.log('   ✅ No negative monetary values found');
      results.passed.push('No negative values');
    } else {
      console.log(`   ❌ Found ${negativeValues.rows.length} orders with negative values:`);
      negativeValues.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Negative ${row.negative_field}`);
      });
      results.failed.push(`${negativeValues.rows.length} orders with negative values`);
    }

    console.log('');

    // ============================================================
    // 2.6 CHECK FOR OVERPAYMENTS
    // ============================================================
    console.log('📋 2.6 CHECKING FOR OVERPAYMENTS\n');

    const overpayments = await query(`
      SELECT 
        id,
        order_number,
        total_amount,
        amount_paid,
        (amount_paid - total_amount) as overpayment,
        payment_status
      FROM orders
      WHERE amount_paid > total_amount + 0.01
      LIMIT 10
    `);

    if (overpayments.rows.length === 0) {
      console.log('   ✅ No overpayments detected');
      results.passed.push('No overpayments');
    } else {
      console.log(`   ⚠️  Found ${overpayments.rows.length} orders with overpayments:`);
      overpayments.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Total=${row.total_amount}, Paid=${row.amount_paid}, Over by=${row.overpayment}`);
      });
      results.warnings.push(`${overpayments.rows.length} orders overpaid`);
    }

    console.log('');

    // ============================================================
    // 2.7 CHECK DISCOUNT LIMITS
    // ============================================================
    console.log('📋 2.7 CHECKING DISCOUNT LIMITS\n');

    const invalidDiscounts = await query(`
      SELECT 
        id,
        order_number,
        subtotal,
        discount_amount,
        (discount_amount / NULLIF(subtotal, 0) * 100) as discount_percentage
      FROM orders
      WHERE discount_amount > subtotal
      LIMIT 10
    `);

    if (invalidDiscounts.rows.length === 0) {
      console.log('   ✅ No discounts exceed subtotal (max 100%)');
      results.passed.push('Discount limits valid');
    } else {
      console.log(`   ❌ Found ${invalidDiscounts.rows.length} orders with discount > subtotal:`);
      invalidDiscounts.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}: Subtotal=${row.subtotal}, Discount=${row.discount_amount} (${row.discount_percentage}%)`);
      });
      results.failed.push(`${invalidDiscounts.rows.length} orders have excessive discounts`);
    }

    console.log('');

    // ============================================================
    // 2.8 VERIFY ORDER ITEM CALCULATIONS
    // ============================================================
    console.log('📋 2.8 CHECKING ORDER ITEM CALCULATIONS (quantity × unit_price)\n');

    const itemCheck = await query(`
      SELECT 
        oi.id,
        o.order_number,
        pi.name as item_name,
        oi.quantity,
        oi.unit_price,
        oi.total_price as stored_total,
        (oi.quantity * oi.unit_price) as calculated_total,
        ABS(oi.total_price - (oi.quantity * oi.unit_price)) as difference
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN price_items pi ON pi.id = oi.price_item_id
      WHERE ABS(oi.total_price - (oi.quantity * oi.unit_price)) > 0.01
      LIMIT 10
    `);

    if (itemCheck.rows.length === 0) {
      console.log('   ✅ All item totals correctly calculated (quantity × price)');
      results.passed.push('Order item calculations accurate');
    } else {
      console.log(`   ❌ Found ${itemCheck.rows.length} items with incorrect totals:`);
      itemCheck.rows.forEach((row: any) => {
        console.log(`      Order ${row.order_number}, Item: ${row.item_name}, Qty=${row.quantity}, Price=${row.unit_price}, Stored=${row.stored_total}, Should be=${row.calculated_total}`);
      });
      results.failed.push(`${itemCheck.rows.length} items with calculation errors`);
    }

    console.log('');

    // ============================================================
    // 2.9 STATISTICAL ANALYSIS
    // ============================================================
    console.log('📋 2.9 FINANCIAL STATISTICS\n');

    const stats = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN payment_status = 'UNPAID' THEN 1 END) as unpaid_orders,
        COUNT(CASE WHEN payment_status = 'PARTIAL' THEN 1 END) as partial_orders,
        SUM(total_amount) as total_revenue,
        SUM(amount_paid) as total_collected,
        SUM(balance) as total_outstanding,
        SUM(discount_amount) as total_discounts,
        AVG(total_amount) as avg_order_value,
        MAX(total_amount) as max_order_value,
        MIN(total_amount) as min_order_value
      FROM orders
    `);

    const s = stats.rows[0];
    console.log(`   📊 Order Statistics:`);
    console.log(`      Total Orders:        ${s.total_orders}`);
    console.log(`      - Paid:              ${s.paid_orders}`);
    console.log(`      - Unpaid:            ${s.unpaid_orders}`);
    console.log(`      - Partial:           ${s.partial_orders}`);
    console.log(`\n   💰 Financial Summary:`);
    console.log(`      Total Revenue:       UGX ${parseFloat(s.total_revenue || 0).toLocaleString('en-UG', {minimumFractionDigits: 2})}`);
    console.log(`      Total Collected:     UGX ${parseFloat(s.total_collected || 0).toLocaleString('en-UG', {minimumFractionDigits: 2})}`);
    console.log(`      Outstanding Balance: UGX ${parseFloat(s.total_outstanding || 0).toLocaleString('en-UG', {minimumFractionDigits: 2})}`);
    console.log(`      Total Discounts:     UGX ${parseFloat(s.total_discounts || 0).toLocaleString('en-UG', {minimumFractionDigits: 2})}`);
    console.log(`\n   📈 Order Values:`);
    console.log(`      Average:             UGX ${parseFloat(s.avg_order_value || 0).toLocaleString('en-UG', {minimumFractionDigits: 2})}`);
    console.log(`      Maximum:             UGX ${parseFloat(s.max_order_value || 0).toLocaleString('en-UG', {minimumFractionDigits: 2})}`);
    console.log(`      Minimum:             UGX ${parseFloat(s.min_order_value || 0).toLocaleString('en-UG', {minimumFractionDigits: 2})}`);

    // Verify collection rate
    const collectionRate = (parseFloat(s.total_collected) / parseFloat(s.total_revenue)) * 100;
    console.log(`\n   💵 Collection Rate:     ${collectionRate.toFixed(2)}%`);
    
    if (collectionRate >= 70) {
      results.passed.push(`Good collection rate: ${collectionRate.toFixed(2)}%`);
    } else {
      results.warnings.push(`Low collection rate: ${collectionRate.toFixed(2)}%`);
    }

    console.log('');

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('='.repeat(80));
    console.log('📊 PHASE 2 AUDIT SUMMARY');
    console.log('='.repeat(80) + '\n');

    console.log(`✅ PASSED: ${results.passed.length} checks`);
    results.passed.forEach(item => console.log(`   ✓ ${item}`));

    if (results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS: ${results.warnings.length} items`);
      results.warnings.forEach(item => console.log(`   ⚠ ${item}`));
    }

    if (results.failed.length > 0) {
      console.log(`\n❌ FAILED: ${results.failed.length} checks`);
      results.failed.forEach(item => console.log(`   ✗ ${item}`));
      console.log('\n🚨 CRITICAL: Fix financial calculation errors before deployment!');
    } else {
      console.log('\n🎉 ALL FINANCIAL CALCULATIONS VERIFIED! Money accuracy confirmed.');
    }

    console.log('\n' + '='.repeat(80) + '\n');

    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error: any) {
    console.error('\n❌ AUDIT ERROR:', error.message);
    process.exit(1);
  }
}

phase2FinancialAudit();
