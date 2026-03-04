import { query } from '../config/database';

async function phase1DatabaseAudit() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 PHASE 1: DATABASE ARCHITECTURE & INTEGRITY AUDIT');
  console.log('='.repeat(80) + '\n');

  const results = {
    passed: [] as string[],
    failed: [] as string[],
    warnings: [] as string[],
  };

  try {
    // ============================================================
    // 1.1 VERIFY FOREIGN KEY CONSTRAINTS
    // ============================================================
    console.log('📋 1.1 CHECKING FOREIGN KEY CONSTRAINTS\n');
    
    const fkResult = await query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `);

    console.log(`✅ Found ${fkResult.rows.length} foreign key constraints:\n`);
    
    const criticalFKs = [
      { table: 'orders', column: 'user_id', references: 'users' },
      { table: 'orders', column: 'customer_id', references: 'customers' },
      { table: 'order_items', column: 'order_id', references: 'orders' },
      { table: 'users', column: 'created_by', references: 'users' },
    ];

    for (const critical of criticalFKs) {
      const found = fkResult.rows.find(
        (fk: any) => fk.table_name === critical.table && 
              fk.column_name === critical.column &&
              fk.foreign_table_name === critical.references
      );
      
      if (found) {
        console.log(`   ✅ ${critical.table}.${critical.column} → ${critical.references} (${found.delete_rule})`);
        results.passed.push(`FK: ${critical.table}.${critical.column} → ${critical.references}`);
      } else {
        console.log(`   ❌ MISSING: ${critical.table}.${critical.column} → ${critical.references}`);
        results.failed.push(`MISSING FK: ${critical.table}.${critical.column} → ${critical.references}`);
      }
    }

    console.log('');

    // ============================================================
    // 1.2 CHECK FOR ORPHANED RECORDS
    // ============================================================
    console.log('📋 1.2 CHECKING FOR ORPHANED RECORDS\n');

    // Check orders without valid users
    const orphanedOrdersByUser = await query(`
      SELECT COUNT(*) as count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE u.id IS NULL
    `);

    if (parseInt(orphanedOrdersByUser.rows[0].count) === 0) {
      console.log('   ✅ No orphaned orders (missing user_id)');
      results.passed.push('No orphaned orders by user');
    } else {
      console.log(`   ❌ Found ${orphanedOrdersByUser.rows[0].count} orders without valid users`);
      results.failed.push(`${orphanedOrdersByUser.rows[0].count} orphaned orders by user`);
    }

    // Check orders without valid customers
    const orphanedOrdersByCustomer = await query(`
      SELECT COUNT(*) as count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE c.id IS NULL
    `);

    if (parseInt(orphanedOrdersByCustomer.rows[0].count) === 0) {
      console.log('   ✅ No orphaned orders (missing customer_id)');
      results.passed.push('No orphaned orders by customer');
    } else {
      console.log(`   ❌ Found ${orphanedOrdersByCustomer.rows[0].count} orders without valid customers`);
      results.failed.push(`${orphanedOrdersByCustomer.rows[0].count} orphaned orders by customer`);
    }

    // Check order_items without valid orders
    const orphanedOrderItems = await query(`
      SELECT COUNT(*) as count
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL
    `);

    if (parseInt(orphanedOrderItems.rows[0].count) === 0) {
      console.log('   ✅ No orphaned order items');
      results.passed.push('No orphaned order items');
    } else {
      console.log(`   ❌ Found ${orphanedOrderItems.rows[0].count} order items without valid orders`);
      results.failed.push(`${orphanedOrderItems.rows[0].count} orphaned order items`);
    }

    console.log('');

    // ============================================================
    // 1.3 VERIFY ID SEQUENCES
    // ============================================================
    console.log('📋 1.3 CHECKING ID SEQUENCES & AUTO-INCREMENT\n');

    const sequences = await query(`
      SELECT 
        schemaname,
        sequencename,
        last_value,
        min_value,
        max_value,
        increment_by
      FROM pg_sequences
      WHERE schemaname = 'public'
      ORDER BY sequencename;
    `);

    console.log(`   Found ${sequences.rows.length} sequences:\n`);
    
    for (const seq of sequences.rows) {
      if (parseInt(seq.last_value) > 0) {
        console.log(`   ✅ ${seq.sequencename}: last_value = ${seq.last_value}`);
        results.passed.push(`Sequence ${seq.sequencename} active`);
      } else {
        console.log(`   ⚠️  ${seq.sequencename}: last_value = ${seq.last_value} (not used yet)`);
        results.warnings.push(`Sequence ${seq.sequencename} not used`);
      }
    }

    console.log('');

    // ============================================================
    // 1.4 CHECK FOR DUPLICATE IDs
    // ============================================================
    console.log('📋 1.4 CHECKING FOR DUPLICATE IDs\n');

    const tables = ['users', 'customers', 'orders', 'order_items', 'price_items'];
    
    for (const table of tables) {
      try {
        const duplicates = await query(`
          SELECT id, COUNT(*) as count
          FROM ${table}
          GROUP BY id
          HAVING COUNT(*) > 1
        `);

        if (duplicates.rows.length === 0) {
          console.log(`   ✅ ${table}: No duplicate IDs`);
          results.passed.push(`${table} has unique IDs`);
        } else {
          console.log(`   ❌ ${table}: Found ${duplicates.rows.length} duplicate IDs`);
          results.failed.push(`${table} has ${duplicates.rows.length} duplicate IDs`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${table}: Table might not exist`);
      }
    }

    console.log('');

    // ============================================================
    // 1.5 VERIFY CRITICAL RELATIONSHIPS COUNT
    // ============================================================
    console.log('📋 1.5 VERIFYING DATA RELATIONSHIPS\n');

    const orderCount = await query('SELECT COUNT(*) as count FROM orders');
    const orderItemsCount = await query('SELECT COUNT(*) as count FROM order_items');
    const customersCount = await query('SELECT COUNT(*) as count FROM customers');
    const usersCount = await query('SELECT COUNT(*) as count FROM users');

    console.log(`   📊 Data Statistics:`);
    console.log(`      Users:         ${usersCount.rows[0].count}`);
    console.log(`      Customers:     ${customersCount.rows[0].count}`);
    console.log(`      Orders:        ${orderCount.rows[0].count}`);
    console.log(`      Order Items:   ${orderItemsCount.rows[0].count}`);

    if (parseInt(orderCount.rows[0].count) > 0 && parseInt(orderItemsCount.rows[0].count) === 0) {
      console.log(`\n   ⚠️  WARNING: ${orderCount.rows[0].count} orders but NO order items!`);
      results.warnings.push(`Orders exist but no order items`);
    } else if (parseInt(orderCount.rows[0].count) > 0) {
      const avgItems = parseInt(orderItemsCount.rows[0].count) / parseInt(orderCount.rows[0].count);
      console.log(`\n   ✅ Average ${avgItems.toFixed(1)} items per order`);
      results.passed.push(`Orders have associated items`);
    }

    console.log('');

    // ============================================================
    // 1.6 CHECK ORDER NUMBER UNIQUENESS
    // ============================================================
    console.log('📋 1.6 CHECKING ORDER NUMBER UNIQUENESS\n');

    const duplicateOrderNumbers = await query(`
      SELECT order_number, COUNT(*) as count
      FROM orders
      GROUP BY order_number
      HAVING COUNT(*) > 1
    `);

    if (duplicateOrderNumbers.rows.length === 0) {
      console.log('   ✅ All order numbers are unique');
      results.passed.push('Order numbers unique');
    } else {
      console.log(`   ❌ Found ${duplicateOrderNumbers.rows.length} duplicate order numbers:`);
      duplicateOrderNumbers.rows.forEach((row: any) => {
        console.log(`      - ${row.order_number} appears ${row.count} times`);
      });
      results.failed.push(`${duplicateOrderNumbers.rows.length} duplicate order numbers`);
    }

    console.log('');

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('='.repeat(80));
    console.log('📊 PHASE 1 AUDIT SUMMARY');
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
      console.log('\n🚨 CRITICAL: Fix these issues before deployment!');
    } else {
      console.log('\n🎉 ALL CHECKS PASSED! Database integrity verified.');
    }

    console.log('\n' + '='.repeat(80) + '\n');

    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error: any) {
    console.error('\n❌ AUDIT ERROR:', error.message);
    process.exit(1);
  }
}

phase1DatabaseAudit();
