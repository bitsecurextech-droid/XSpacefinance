const db = require('./config/database');

async function setAdmin() {
  const email = 'support@xspacefinance.com'; // Change if your admin email is different
  try {
    const result = await db.run('UPDATE users SET is_admin = 1 WHERE email = ?', [email]);
    if (result.changes > 0) {
      console.log(`✅ User ${email} is now admin.`);
    } else {
      console.log(`⚠️ User ${email} not found. Check the email.`);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

setAdmin().catch(console.error);