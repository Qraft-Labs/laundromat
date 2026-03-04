import { query } from './config/database';
import bcrypt from 'bcryptjs';

async function createManagerAccount() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('manager123', 10);
    
    // Create Manager account
    const result = await query(
      `INSERT INTO users (email, password, full_name, phone, role, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, full_name, phone, role, status`,
      [
        'manager@lushlaundry.com',
        hashedPassword,
        'Test Manager',
        '+1234567890',
        'MANAGER',
        'ACTIVE'
      ]
    );
    
    console.log('✅ Manager account created successfully:');
    console.log(result.rows[0]);
    console.log('\n📧 Email: manager@lushlaundry.com');
    console.log('🔑 Password: manager123');
    
    process.exit(0);
  } catch (error: any) {
    if (error.message && error.message.includes('duplicate key')) {
      console.log('⚠️  Manager account already exists');
      console.log('📧 Email: manager@lushlaundry.com');
      console.log('🔑 Password: manager123');
      process.exit(0);
    } else {
      console.error('❌ Error creating manager account:', error);
      process.exit(1);
    }
  }
}

createManagerAccount();
