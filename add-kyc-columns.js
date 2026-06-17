const db = require('./config/database');

async function addKycColumns() {
  try {
    await db.run("ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'not_submitted'");
    console.log('✅ kyc_status added');
  } catch (e) { if (!e.message.includes('duplicate')) console.log('⚠️ kyc_status:', e.message); }

  try {
    await db.run("ALTER TABLE users ADD COLUMN kyc_doc TEXT");
    console.log('✅ kyc_doc added');
  } catch (e) { if (!e.message.includes('duplicate')) console.log('⚠️ kyc_doc:', e.message); }

  console.log('✅ KYC columns ready.');
}

addKycColumns().catch(console.error);