import { query } from '../config/database';

async function addSoftDeleteToUsers() {
  console.log('\n🔧 ADDING SOFT DELETE TO USERS TABLE\n');
  console.log('═'.repeat(70) + '\n');

  try {
    // 1. Add deleted_at column
    console.log('📋 Step 1: Adding deleted_at column...');
    
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);
    
    console.log('✅ deleted_at column added\n');

    // 2. Add deleted_by column for audit trail
    console.log('📋 Step 2: Adding deleted_by column...');
    
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
    `);
    
    console.log('✅ deleted_by column added\n');

    // 3. Verify columns
    console.log('📋 Step 3: Verifying soft delete columns...');
    
    const columnsCheck = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' 
        AND column_name IN ('deleted_at', 'deleted_by')
      ORDER BY column_name
    `);

    console.log('   Soft Delete Columns:');
    columnsCheck.rows.forEach((row: any) => {
      console.log(`      ✅ ${row.column_name} (${row.data_type})`);
    });
    console.log('');

    // 4. Check current user statuses
    console.log('📋 Step 4: Current user statistics...');
    
    const stats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_records,
        COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as soft_deleted
      FROM users
    `);

    const userStats = stats.rows[0];
    console.log(`   Total User Records: ${userStats.total_users}`);
    console.log(`   Active Records: ${userStats.active_records}`);
    console.log(`   Soft Deleted: ${userStats.soft_deleted}\n`);

    // 5. Summary
    console.log('═'.repeat(70));
    console.log('📊 SOFT DELETE IMPLEMENTATION SUMMARY\n');
    
    console.log('✅ Database Changes:');
    console.log('   - deleted_at: Timestamp when user was soft deleted');
    console.log('   - deleted_by: Admin ID who performed deletion\n');
    
    console.log('✅ How Soft Delete Works:');
    console.log('   1. When admin deletes user → deleted_at = NOW()');
    console.log('   2. User remains in database (email stays reserved)');
    console.log('   3. Cannot re-register with same email');
    console.log('   4. All historical data preserved\n');
    
    console.log('✅ Query Behavior:');
    console.log('   - Default queries: WHERE deleted_at IS NULL');
    console.log('   - Show all including deleted: No WHERE clause');
    console.log('   - Restore user: SET deleted_at = NULL\n');

    console.log('✅ Benefits:');
    console.log('   - Data integrity maintained');
    console.log('   - Audit trail preserved');
    console.log('   - Can restore if deleted by mistake');
    console.log('   - Email uniqueness enforced forever\n');

    console.log('📝 Next Steps:');
    console.log('   - Update getAllUsers() to filter deleted_at IS NULL');
    console.log('   - Update deleteUser() to use soft delete');
    console.log('   - Add "Show Deleted Users" filter option');
    console.log('   - Add "Restore User" functionality\n');

    console.log('═'.repeat(70) + '\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addSoftDeleteToUsers();
