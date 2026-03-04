import { query } from './config/database';
import bcrypt from 'bcryptjs';

async function createStaffAccounts() {
  try {
    console.log('\n🔧 Creating staff accounts...\n');
    
    // Hash passwords
    const managerPassword = await bcrypt.hash('Manager123!', 10);
    const cashierPassword = await bcrypt.hash('Cashier123!', 10);
    
    // Create Manager account
    try {
      const managerResult = await query(
        `INSERT INTO users (email, password, full_name, phone, role, status, auth_provider, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, email, full_name, role`,
        [
          'manager@lushlaundry.com',
          managerPassword,
          'Laundry Manager',
          '+256 700 111 111',
          'MANAGER',
          'ACTIVE',
          'LOCAL'
        ]
      );
      console.log('✅ Manager account created:', managerResult.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('⚠️  Manager account already exists');
      } else {
        throw error;
      }
    }
    
    // Create Cashier account
    try {
      const cashierResult = await query(
        `INSERT INTO users (email, password, full_name, phone, role, status, auth_provider, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, email, full_name, role`,
        [
          'cashier@lushlaundry.com',
          cashierPassword,
          'Front Desk Cashier',
          '+256 700 222 222',
          'DESKTOP_AGENT',
          'ACTIVE',
          'LOCAL'
        ]
      );
      console.log('✅ Cashier account created:', cashierResult.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log('⚠️  Cashier account already exists');
      } else {
        throw error;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 LOGIN CREDENTIALS');
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

createStaffAccounts();
