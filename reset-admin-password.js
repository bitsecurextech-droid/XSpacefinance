const db = require('./config/database');
const bcrypt = require('bcrypt');

async function resetPassword() {
  const email = 'admin@xspacefinance.com';
  const newPassword = 'Admin@2026#Secure'; // Choose a strong one
  const hashed = await bcrypt.hash(newPassword, 10);

  await db.run('UPDATE users SET password = ? WHERE email = ?', [hashed, email]);
  console.log(`✅ Password for ${email} reset to: ${newPassword}`);
}

resetPassword().catch(console.error);