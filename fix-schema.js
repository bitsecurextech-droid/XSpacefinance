const db = require('./config/database');

async function fix() {
  console.log('🔧 Adding missing columns...');

  // 1. Add description to activity_log
  try {
    await db.run("ALTER TABLE activity_log ADD COLUMN description TEXT");
    console.log('✅ Added description to activity_log');
  } catch (e) { if (!e.message.includes('duplicate')) console.error(e); }

  // 2. Add start_date to investments (if not exists)
  try {
    await db.run("ALTER TABLE investments ADD COLUMN start_date TEXT");
    console.log('✅ Added start_date to investments');
  } catch (e) { if (!e.message.includes('duplicate')) console.error(e); }

  // 3. Update existing investments: set start_date = created_at where null
  await db.run("UPDATE investments SET start_date = created_at WHERE start_date IS NULL");
  console.log('✅ Updated start_date for existing investments');

  // 4. Ensure deposits has notes (already added, but just in case)
  try {
    await db.run("ALTER TABLE deposits ADD COLUMN notes TEXT");
    console.log('✅ Added notes to deposits (if missing)');
  } catch (e) { if (!e.message.includes('duplicate')) console.error(e); }

  console.log('✅ Schema update complete.');
}

fix().catch(console.error);