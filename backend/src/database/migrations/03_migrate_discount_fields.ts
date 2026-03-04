import { query } from '../../config/database';

/**
 * DISCOUNT FIELD MIGRATION
 * 
 * Problem: The system has 3 discount fields:
 * - `discount` (INTEGER, NOT NULL) - OLD, not being used, always 0
 * - `discount_percentage` (NUMERIC) - Currently in use (e.g., 5.00, 15.00)
 * - `discount_amount` (INTEGER) - Currently in use (calculated UGX amount)
 * 
 * Solution:
 * 1. Copy any non-zero `discount` values to `discount_amount` (backup)
 * 2. Set default value for `discount` to 0
 * 3. Add comment to deprecate `discount` field
 * 4. Update application to ONLY use discount_percentage and discount_amount
 */

async function migrateDiscountFields() {
  console.log('\n🔄 MIGRATING DISCOUNT FIELDS\n');

  try {
    // 1. Check if old discount field has any non-zero values
    const oldDiscounts = await query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE discount > 0
    `);

    console.log(`Old 'discount' field has ${oldDiscounts.rows[0].count} non-zero values`);

    if (parseInt(oldDiscounts.rows[0].count) > 0) {
      console.log('⚠️  WARNING: Found orders using old discount field!');
      console.log('   Copying to discount_amount...\n');
      
      // Copy old discount values to discount_amount (if not already set)
      await query(`
        UPDATE orders
        SET discount_amount = COALESCE(discount_amount, discount)
        WHERE discount > 0 AND (discount_amount IS NULL OR discount_amount = 0)
      `);
      
      console.log('✅ Copied old discount values to discount_amount');
    }

    // 2. Set default for discount field to 0
    await query(`
      ALTER TABLE orders 
      ALTER COLUMN discount SET DEFAULT 0
    `);
    console.log('✅ Set default value for discount = 0');

    // 3. Add comment to deprecate old field
    await query(`
      COMMENT ON COLUMN orders.discount IS 'DEPRECATED: Use discount_amount instead. This field is kept for backwards compatibility only.'
    `);
    console.log('✅ Added deprecation comment to old discount field');

    // 4. Verify current discount usage
    const discountStats = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN discount_percentage > 0 THEN 1 END) as orders_with_percentage,
        COUNT(CASE WHEN discount_amount > 0 THEN 1 END) as orders_with_amount,
        COUNT(CASE WHEN discount > 0 THEN 1 END) as orders_with_old_discount,
        SUM(COALESCE(discount_amount, 0)) as total_discounts_given
      FROM orders
    `);

    const stats = discountStats.rows[0];
    console.log('\n📊 Discount Statistics:');
    console.log(`   Total Orders:             ${stats.total_orders}`);
    console.log(`   With discount_percentage: ${stats.orders_with_percentage}`);
    console.log(`   With discount_amount:     ${stats.orders_with_amount}`);
    console.log(`   With old discount field:  ${stats.orders_with_old_discount}`);
    console.log(`   Total Discounts Given:    UGX ${parseFloat(stats.total_discounts_given || 0).toLocaleString('en-UG')}`);

    console.log('\n✅ Discount field migration complete!');
    console.log('\n📝 Going forward:');
    console.log('   ✓ Use discount_percentage for percentage (e.g., 5, 10, 15)');
    console.log('   ✓ Use discount_amount for UGX amount');
    console.log('   ✗ Do NOT use the old discount field\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrateDiscountFields();
