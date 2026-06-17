const db = require('./config/database');

async function checkDatabase() {
  console.log('Checking database tables...');
  
  const tables = ['users', 'investments', 'plans', 'deposits', 'withdrawals', 'transactions', 'notifications', 'activity_log'];
  
  for (const table of tables) {
    try {
      const result = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table]);
      if (result) {
        console.log(`✅ Table '${table}' exists`);
        
        // Get columns for users table
        if (table === 'users') {
          const columns = await db.all(`PRAGMA table_info(users)`);
          console.log(`   Columns in users: ${columns.map(c => c.name).join(', ')}`);
        }
      } else {
        console.log(`❌ Table '${table}' does NOT exist`);
      }
    } catch (err) {
      console.log(`❌ Error checking ${table}:`, err.message);
    }
  }
}

checkDatabase().catch(console.error);