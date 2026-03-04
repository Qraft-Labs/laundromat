// Check users in database
const { query } = require('./src/config/database');

async function checkUsers() {
  try {
    const result = await query('SELECT id, full_name, username, role FROM users ORDER BY id');
    console.log('Users in database:');
    console.table(result.rows);
    
    // Try to verify admin password
    const adminResult = await query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminResult.rows.length > 0) {
      console.log('\nAdmin user exists');
      console.log('Username:', adminResult.rows[0].username);
      console.log('Role:', adminResult.rows[0].role);
    } else {
      console.log('\n❌ No admin user found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
