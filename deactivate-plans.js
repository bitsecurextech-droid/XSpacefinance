const db = require('./config/database');

async function deactivate() {
  await db.run("UPDATE plans SET is_active = 0 WHERE name IN ('Starter', 'Premium', 'VIP')");
  console.log('✅ Old plans deactivated (they will not show)');
}

deactivate().catch(console.error);