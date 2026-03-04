import { query } from '../../config/database';

async function addVATSettings() {
  try {
    console.log('🔄 Adding VAT settings to database...');

    // Insert VAT setting with default OFF
    await query(`
      INSERT INTO business_settings (setting_key, setting_value, updated_at)
      VALUES ('vat_enabled', '{"enabled": false, "rate": 18}'::jsonb, NOW())
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = '{"enabled": false, "rate": 18}'::jsonb,
        updated_at = NOW()
    `);

    // Verify setting was added
    const result = await query(`
      SELECT setting_key, setting_value, updated_at
      FROM business_settings
      WHERE setting_key = 'vat_enabled'
    `);

    console.log('✅ VAT Setting Added Successfully:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    console.log('');
    console.log('Default Configuration:');
    console.log('  - VAT Enabled: false (OFF)');
    console.log('  - VAT Rate: 18%');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding VAT settings:', error);
    process.exit(1);
  }
}

addVATSettings();
