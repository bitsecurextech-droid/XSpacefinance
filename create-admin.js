require('dotenv').config();
const db = require('./config/database');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  const referralCode = 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (user) {
      await db.run(
        `UPDATE users SET password = ?, is_admin = 1, referral_code = ? WHERE email = ?`,
        [hashed, referralCode, email]
      );
      console.log(`✅ Admin updated: ${email}`);
    } else {
      await db.run(
        `INSERT INTO users (first_name, last_name, email, password, is_admin, currency, country, referral_code, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Admin', 'User', email, hashed, 1, 'USD', 'US', referralCode, 1]
      );
      console.log(`✅ Admin created: ${email}`);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

createAdmin().catch(console.error);