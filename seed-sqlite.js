const db = require('./config/database');

async function seed() {
  console.log('🌱 Seeding SQLite database...');

  // Users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      country TEXT DEFAULT 'UK',
      currency TEXT DEFAULT 'GBP',
      balance REAL DEFAULT 0,
      phone TEXT,
      dob TEXT,
      kyc_status TEXT DEFAULT 'pending',
      referral_code TEXT UNIQUE,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    )
  `);

  // Plans table
  await db.run(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roi_percent INTEGER NOT NULL,
      duration_days INTEGER NOT NULL,
      min_amount REAL NOT NULL,
      max_amount REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      referral_bonus REAL DEFAULT 0,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Investments table
  await db.run(`
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      end_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    )
  `);

  // Deposits table
  await db.run(`
    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      proof_path TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Transactions table
  await db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Notifications table
  await db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Insert your five plans (if they don't exist)
  const existingPlans = await db.get('SELECT COUNT(*) as count FROM plans');
  if (existingPlans.count === 0) {
    await db.run(`
      INSERT INTO plans (name, roi_percent, duration_days, min_amount, max_amount, referral_bonus, description) VALUES
      ('108 Circle', 200, 30, 100, 2221, 2.00, 'Entry-level investment circle. Perfect for new investors.'),
      ('2222 Investment', 200, 30, 2222, 7999, 3.00, 'Mid-tier plan with enhanced returns for growing portfolios.'),
      ('8888 Investment', 300, 30, 8888, 14999, 4.00, 'Premium investment tier offering high-yield returns.'),
      ('Tier 3 Investment', 350, 30, 15000, 19999, 5.00, 'Exclusive high-performance plan for experienced investors.'),
      ('Bitcoin Elite Group', 750, 14, 20000, 999999999, 5.00, 'Ultimate short-term, high-yield opportunity for elite investors.')
    `);
    console.log('✅ Plans inserted.');
  } else {
    console.log('✅ Plans already exist.');
  }

  console.log('✅ Database seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});