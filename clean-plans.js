const db = require('./config/database');

async function clean() {
  await db.run("DELETE FROM plans WHERE name IN ('Starter', 'Premium', 'VIP')");
  console.log('✅ Old plans removed');
}

clean().catch(console.error);