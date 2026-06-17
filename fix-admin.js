const db = require('./config/database');
const bcrypt = require('bcrypt');

async function fixAdmin() {
  const email = 'admin@xspacefinance.com';
  const password = 'XSpace@2026Secure!';
  const hashed = await bcrypt.hash(password, 10);
  const referralCode = 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    // Check if user exists
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (user) {
      // Update existing
      await db.run('UPDATE users SET password = ?, is_admin = 1, referral_code = ? WHERE email = ?', [hashed, referralCode, email]);
      console.log('✅ Admin updated successfully.');
    } else {
      // Insert new
      await db.run(
        `INSERT INTO users (first_name, last_name, email, password, is_admin, currency, country, referral_code, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Admin', 'User', email, hashed, 1, 'USD', 'US', referralCode, 1]
      );
      console.log('✅ Admin created successfully.');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

fixAdmin().catch(console.error);