const { query } = require('./dist/config/database');

(async () => {
  try {
    const result = await query(
      "SELECT pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conname = 'chk_order_status'"
    );
    console.log('\n=== Order Status Constraint ===');
    console.log(result.rows[0]?.definition);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
