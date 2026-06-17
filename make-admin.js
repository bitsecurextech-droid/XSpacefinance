const db = require('./config/database');

async function makeAdmin() {
  const email = 'admin@xspacefinance.com'; // Change to your admin email if different

  try {
    const result = await db.run('UPDATE users SET is_admin = 1 WHERE email = ?', [email]);
    if (result.changes > 0) {
      console.log(`✅ User ${email} is now admin.`);
    } else {
      console.log(`⚠️ User ${email} not found. Please check the email.`);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

makeAdmin().catch(console.error);