const db = require('./config/database');

async function migrate() {
  const columns = [
    'phone TEXT',
    'dob TEXT',
    'address TEXT',
    'address2 TEXT',
    'city TEXT',
    'state TEXT',
    'postal_code TEXT',
    'last_login TEXT'
  ];
  for (const col of columns) {
    try {
      await db.run(`ALTER TABLE users ADD COLUMN ${col}`);
      console.log(`✅ Added ${col.split(' ')[0]}`);
    } catch (e) {
      if (!e.message.includes('duplicate')) console.warn(e.message);
    }
  }
  console.log('✅ Profile columns added.');
}

migrate().catch(console.error);