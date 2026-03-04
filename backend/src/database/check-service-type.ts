import { query } from '../config/database';

async function checkServiceType() {
  try {
    console.log('🔍 Checking service_type column constraints...\n');
    
    // Check column definition
    const columnInfo = await query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
        AND column_name = 'service_type'
    `);
    
    console.log('Column definition:');
    console.log(columnInfo.rows[0]);
    console.log('');
    
    // Check for any CHECK constraints
    const constraints = await query(`
      SELECT 
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'order_items'
    `);
    
    if (constraints.rows.length > 0) {
      console.log('CHECK constraints found:');
      constraints.rows.forEach((row: any) => {
        console.log(`  ${row.constraint_name}: ${row.check_clause}`);
      });
    } else {
      console.log('✅ No CHECK constraints on order_items table');
      console.log('✅ EXPRESS service type will be accepted!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkServiceType();
