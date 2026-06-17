// database.js – PostgreSQL (Supabase) version
const { Pool } = require('pg');
require('dotenv').config(); // optional, for local .env support

// Create connection pool using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Supabase
});

// Helper: convert '?' placeholders to PostgreSQL '$1', '$2', ...
function convertPlaceholders(sql, params) {
  if (!params || params.length === 0) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Get a single row
const get = async (sql, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

// Get multiple rows
const all = async (sql, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return result.rows;
  } finally {
    client.release();
  }
};

// Run an INSERT, UPDATE, or DELETE
const run = async (sql, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    // Return the last inserted ID if available (for INSERT)
    return { lastID: result.rows[0]?.id || null };
  } finally {
    client.release();
  }
};

// Close the pool (for graceful shutdown)
const close = async () => {
  await pool.end();
};

module.exports = {
  get,
  all,
  run,
  close
};
