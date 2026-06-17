const db = require('./config/database');

async function fix() {
  try {
    await db.run("ALTER TABLE activity_log ADD COLUMN type TEXT");
    console.log('✅ Added type to activity_log');
  } catch (e) { if (!e.message.includes('duplicate')) console.error(e); }
  try {
    await db.run("ALTER TABLE deposits ADD COLUMN notes TEXT");
    console.log('✅ Added notes to deposits');
  } catch (e) { if (!e.message.includes('duplicate')) console.error(e); }
  console.log('✅ All columns added');
}

fix().catch(console.error);