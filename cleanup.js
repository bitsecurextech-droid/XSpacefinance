const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/xspacefinance.db');

db.run("DELETE FROM transactions WHERE description LIKE 'Admin adjustment:%'", function(err) {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Deleted ' + this.changes + ' old transactions');
  }
  db.close();
});