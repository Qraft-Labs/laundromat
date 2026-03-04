import { query } from './config/database';
import bcrypt from 'bcryptjs';

async function resetPasswords() {
  try {
    console.log('\n🔄 Resetting staff passwords...\n');
    
    // Hash passwords
    const managerPassword = await bcrypt.hash('Manager123!', 10);
    const cashierPassword = await bcrypt.hash('Cashier123!', 10);
    
    // Update Manager password
    await query(
      `UPDATE users 
       SET password = $1, updated_at = NOW()
       WHERE email = $2 AND auth_provider = 'LOCAL'`,
      [managerPassword, 'manager@lushlaundry.com']
    );
    console.log('✅ Manager password reset');
    
    // Update Cashier password
    await query(
      `UPDATE users 
       SET password = $1, updated_at = NOW()
       WHERE email = $2 AND auth_provider = 'LOCAL'`,
      [cashierPassword, 'cashier@lushlaundry.com']
    );
    console.log('✅ Cashier password reset');
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 UPDATED LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('\n📊 MANAGER ACCOUNT:');
    console.log('   Email:    manager@lushlaundry.com');
    console.log('   Password: Manager123!');
    console.log('\n💼 CASHIER ACCOUNT:');
    console.log('   Email:    cashier@lushlaundry.com');
    console.log('   Password: Cashier123!');
    console.log('\n👑 ADMIN ACCOUNT:');
    console.log('   Login via Google OAuth (your existing account)');
    console.log('\n' + '='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();
