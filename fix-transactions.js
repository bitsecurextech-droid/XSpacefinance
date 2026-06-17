const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/xspacefinance.db');

db.run("UPDATE transactions SET description = REPLACE(description, 'Admin adjustment: ', '') WHERE description LIKE 'Admin adjustment:%'", function(err) {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Updated ' + this.changes + ' transactions');
  }
  db.close();
});