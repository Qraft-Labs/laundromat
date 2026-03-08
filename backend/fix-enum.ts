/**
 * Fix User Role ENUM
 * Adds MANAGER and DESKTOP_AGENT to the user_role enum
 */

import { query } from './src/config/database';

async function fixEnumValues() {
  try {
    console.log('🔧 Checking user_role enum values...');
    
    // Add MANAGER and DESKTOP_AGENT to the enum if they don't exist
    await query(`
      DO $$ 
      BEGIN
        -- Add MANAGER if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'MANAGER' 
          AND enumtypid = 'user_role'::regtype
        ) THEN
          ALTER TYPE user_role ADD VALUE 'MANAGER';
          RAISE NOTICE 'Added MANAGER to user_role enum';
        END IF;
        
        -- Add DESKTOP_AGENT if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'DESKTOP_AGENT' 
          AND enumtypid = 'user_role'::regtype
        ) THEN
          ALTER TYPE user_role ADD VALUE 'DESKTOP_AGENT';
          RAISE NOTICE 'Added DESKTOP_AGENT to user_role enum';
        END IF;
      END $$;
    `);
    
    console.log('✅ user_role enum updated successfully!');
    console.log('');
    
    // Show current enum values
    const result = await query(`
      SELECT enumlabel as role 
      FROM pg_enum 
      WHERE enumtypid = 'user_role'::regtype 
      ORDER BY enumsortorder;
    `);
    
    console.log('📋 Available user roles:');
    result.rows.forEach((row: any) => {
      console.log(`   • ${row.role}`);
    });
    console.log('');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to update enum:', error.message);
    process.exit(1);
  }
}

fixEnumValues();
