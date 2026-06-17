const db = require('./config/database');

async function listUsers() {
  try {
    const users = await db.all('SELECT id, email, first_name, is_admin FROM users');
    console.log('Users in database:');
    users.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.first_name}, Admin: ${u.is_admin || 0}`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
}

listUsers();