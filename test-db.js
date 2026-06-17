const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'xspacefinance.db');
const db = new sqlite3.Database(dbPath);

module.exports = {
  get: (sql, params) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  }),
  all: (sql, params) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  }),
  run: (sql, params) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) { err ? reject(err) : resolve({ lastID: this.lastID }); });
  })
};