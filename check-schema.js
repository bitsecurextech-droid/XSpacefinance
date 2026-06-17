const db = require('./config/database');

async function check() {
  try {
    const columns = await db.all("PRAGMA table_info(users)");
    console.log('Columns in users table:');
    columns.forEach(col => console.log(col.name));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

check();