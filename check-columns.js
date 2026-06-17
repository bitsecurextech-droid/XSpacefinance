const db = require('./config/database');

async function check() {
  const cols = ['phone','dob','address','address2','city','state','postal_code','last_login'];
  for (const col of cols) {
    try {
      await db.get(`SELECT ${col} FROM users LIMIT 1`);
      console.log(`✅ ${col} exists`);
    } catch (e) {
      console.log(`❌ ${col} missing – run migration`);
    }
  }
}
check().catch(console.error);