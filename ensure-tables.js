const db = require('./config/database');

async function ensure() {
  console.log('🔧 Ensuring all tables and columns exist...');

  // 1. Activity log (add type column)
  try {
    await db.run("ALTER TABLE activity_log ADD COLUMN type TEXT");
    console.log('✅ Added type to activity_log');
  } catch (e) { if (!e.message.includes('duplicate')) console.error(e); }

  // 2. Deposits (add notes column)
  try {
    await db.run("ALTER TABLE deposits ADD COLUMN notes TEXT");
    console.log('✅ Added notes to deposits');
  } catch (e) { if (!e.message.includes('duplicate')) console.error(e); }

  // 3. Withdrawals table (if missing)
  await db.run(`CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    method TEXT,
    address TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT,
    processed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  console.log('✅ Withdrawals table ready');

  // 4. Investments table (if missing)
  await db.run(`CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'active',
    created_at TEXT,
    end_date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(plan_id) REFERENCES plans(id)
  )`);
  console.log('✅ Investments table ready');

  // 5. Deposits table (if missing – just in case)
  await db.run(`CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    method TEXT,
    proof_path TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT,
    processed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  console.log('✅ Deposits table ready');

  console.log('✅ All tables and columns are ready.');
}

ensure().catch(console.error);