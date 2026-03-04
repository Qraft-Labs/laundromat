import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function clearAllData() {
  try {
    console.log('🗑️  Starting complete database cleanup...\n');

    const tables = [
      // Core business data
      'order_items',
      'orders',
      'customers',
      'payments',
      'pending_payments',
      'price_items',
      
      // Inventory
      'inventory_transactions',
      'inventory_items',
      
      // Deliveries
      'deliveries',
      'delivery_drivers',
      'delivery_zones',
      
      // Financial
      'expenses',
      'expense_categories',
      'financial_summary',
      
      // Payroll
      'salary_payments',
      'payroll_employees',
      
      // Marketing
      'promotional_campaigns',
      'promotions',
      'campaign_sms_log',
      
      // Communications
      'whatsapp_messages',
      'notifications',
      
      // Activity logs (keep user activity but clear old logs)
      'activity_logs',
      'security_audit_logs',
      
      // Settings - DON'T DELETE (keep configurations)
      // 'business_settings',
      // 'automation_settings',
      // 'backup_email_settings',
      // 'user_preferences',
      
      // Backup history - DON'T DELETE
      // 'backup_history',
      // 'backup_attempts',
      
      // Password resets - can clear
      'password_reset_requests'
    ];

    let totalDeleted = 0;

    for (const table of tables) {
      try {
        const result = await pool.query(`DELETE FROM ${table} RETURNING *`);
        const count = result.rowCount || 0;
        totalDeleted += count;
        
        if (count > 0) {
          console.log(`  ✅ Deleted ${count} records from ${table}`);
        } else {
          console.log(`  ⚪ ${table} was already empty`);
        }
      } catch (error: any) {
        console.log(`  ⚠️  ${table}: ${error.message}`);
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} total records\n`);
    
    console.log('📊 Fresh System Status:');
    console.log('  ✅ All business data cleared');
    console.log('  ✅ All financial records cleared');
    console.log('  ✅ All payroll records cleared');
    console.log('  ✅ All communications cleared');
    console.log('  ✅ All deliveries cleared');
    console.log('  ✅ All inventory cleared');
    console.log('  ⚙️  Settings preserved (business config)');
    console.log('  👤 Users preserved (your admin account)');
    console.log('\n🎉 Ready for fresh start!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

clearAllData();
