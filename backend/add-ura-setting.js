// Quick script to add URA compliance toggle setting to database
const { query } = require('./dist/config/database');

async function addURASetting() {
  try {
    await query(`
      INSERT INTO business_settings (setting_key, setting_value, updated_at)
      VALUES ('ura_compliance_enabled', 'false', NOW())
      ON CONFLICT (setting_key) DO NOTHING
    `);
    
    console.log('✅ URA compliance toggle setting added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding URA setting:', error);
    process.exit(1);
  }
}

addURASetting();
