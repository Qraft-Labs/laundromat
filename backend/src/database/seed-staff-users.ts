import { query } from '../config/database';
import bcrypt from 'bcryptjs';

/**
 * Seed Staff Users for Login Testing
 * Creates 5 staff accounts with different roles for testing
 */

interface StaffUser {
  name: string;
  email: string;
  password: string;
  role: 'DESKTOP_AGENT' | 'MANAGER' | 'ADMIN';
  phone?: string;
}

const staffUsers: StaffUser[] = [
  {
    name: 'John Mugisha',
    email: 'john.agent@lushlaundry.com',
    password: 'Agent@123',
    role: 'DESKTOP_AGENT',
    phone: '+256700123456'
  },
  {
    name: 'Sarah Nakato',
    email: 'sarah.agent@lushlaundry.com',
    password: 'Agent@123',
    role: 'DESKTOP_AGENT',
    phone: '+256700123457'
  },
  {
    name: 'David Okello',
    email: 'david.manager@lushlaundry.com',
    password: 'Manager@123',
    role: 'MANAGER',
    phone: '+256700123458'
  },
  {
    name: 'Grace Atim',
    email: 'grace.manager@lushlaundry.com',
    password: 'Manager@123',
    role: 'MANAGER',
    phone: '+256700123459'
  },
  {
    name: 'Peter Musoke',
    email: 'peter.agent@lushlaundry.com',
    password: 'Agent@123',
    role: 'DESKTOP_AGENT',
    phone: '+256700123460'
  }
];

async function seedStaffUsers() {
  try {
    console.log('👥 Starting to seed staff users...\n');

    let created = 0;
    let skipped = 0;

    for (const user of staffUsers) {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`   ⏭️  Skipped: ${user.name} (${user.email}) - already exists`);
        skipped++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user
      await query(
        `INSERT INTO users (
          full_name, email, password, role, phone, status, auth_provider, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'LOCAL', NOW(), NOW())`,
        [user.name, user.email, hashedPassword, user.role, user.phone]
      );

      console.log(`   ✅ Created: ${user.name} (${user.role}) - ${user.email}`);
      created++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ STAFF USER SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Created:  ${created} users`);
    console.log(`   Skipped:  ${skipped} users (already exist)`);
    console.log(`   Total:    ${created + skipped} users processed`);

    console.log('\n👤 LOGIN CREDENTIALS:\n');
    console.log('📋 DESKTOP AGENT ACCOUNTS (3):');
    console.log('   1. john.agent@lushlaundry.com    / Agent@123');
    console.log('   2. sarah.agent@lushlaundry.com   / Agent@123');
    console.log('   3. peter.agent@lushlaundry.com   / Agent@123\n');
    
    console.log('📋 MANAGER ACCOUNTS (2):');
    console.log('   1. david.manager@lushlaundry.com / Manager@123');
    console.log('   2. grace.manager@lushlaundry.com / Manager@123\n');

    console.log('💡 PERMISSIONS:');
    console.log('   DESKTOP_AGENT: Create orders, view customers, process payments');
    console.log('   MANAGER:       All agent permissions + reports, manage agents');
    console.log('   ADMIN:         Full system access (your Google account)\n');

    console.log('🔐 SECURITY NOTES:');
    console.log('   - All passwords are bcrypt hashed (10 rounds)');
    console.log('   - Change passwords in production');
    console.log('   - Enable 2FA for sensitive accounts\n');

    // Show current user count by role
    const userStats = await query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `);

    console.log('📊 USER DISTRIBUTION:');
    userStats.rows.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.count}`);
    });
    console.log('\n✅ Ready to test multi-user login!\n');

  } catch (error) {
    console.error('❌ Error seeding staff users:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedStaffUsers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export default seedStaffUsers;
