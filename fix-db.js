const db = require('./config/database');

async function fixDatabase() {
  try {
    await db.connect();
    
    const columns = ['address', 'city', 'state', 'postal_code', 'dob', 'phone'];
    
    for (const column of columns) {
      try {
        await db.run(`ALTER TABLE users ADD COLUMN ${column} TEXT`);
        console.log(`✅ Added column: ${column}`);
      } catch (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`⚠️ Column ${column} already exists`);
        } else {
          console.log(`❌ Error adding ${column}: ${err.message}`);
        }
      }
    }
    
    console.log('✅ Database fix completed!');
    await db.close();
  } catch (error) {
    console.error('Fix failed:', error);
  }
}

fixDatabase();