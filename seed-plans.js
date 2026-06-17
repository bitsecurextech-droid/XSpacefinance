const db = require('./config/database');

async function seed() {
  console.log('🔧 Fixing plans table...');

  // 1. Create table if it doesn't exist
  await db.run(`CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    roi_percent INTEGER,
    duration_days INTEGER,
    min_amount REAL,
    max_amount REAL,
    is_active INTEGER DEFAULT 1,
    referral_bonus REAL,
    description TEXT
  )`);

  // 2. Add missing columns (if they exist, SQLite ignores the error)
  const columns = ['referral_bonus', 'description'];
  for (const col of columns) {
    try {
      await db.run(`ALTER TABLE plans ADD COLUMN ${col} TEXT`);
      console.log(`✅ Added column: ${col}`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log(`⚠️ Column ${col} already exists`);
      } else {
        console.log(`❌ Error adding ${col}:`, e.message);
      }
    }
  }

  // 3. Insert plans (ignore if already exist)
  const plans = [
    ['108 Circle', 200, 30, 100, 2221, 2.00, 'Entry-level investment circle.'],
    ['2222 Investment', 200, 30, 2222, 7999, 3.00, 'Mid-tier plan with enhanced returns.'],
    ['8888 Investment', 300, 30, 8888, 14999, 4.00, 'Premium investment tier.'],
    ['Tier 3 Investment', 350, 30, 15000, 19999, 5.00, 'Exclusive high-performance plan.'],
    ['Bitcoin Elite Group', 750, 14, 20000, 999999999, 5.00, 'Ultimate short-term high-yield.']
  ];

  for (const plan of plans) {
    const [name, roi, days, min, max, bonus, desc] = plan;
    try {
      await db.run(
        `INSERT OR IGNORE INTO plans (name, roi_percent, duration_days, min_amount, max_amount, referral_bonus, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, roi, days, min, max, bonus, desc]
      );
    } catch (e) {
      console.error('Insert error for', name, e.message);
    }
  }

  // 4. Show what we have
  const result = await db.all('SELECT * FROM plans');
  console.log(`✅ Plans table ready – ${result.length} plans found`);
  console.table(result);
}

seed().catch(console.error);