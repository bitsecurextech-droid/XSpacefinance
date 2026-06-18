// database.js – PostgreSQL (Supabase) with IPv4 forced
const { Pool } = require('pg');
const dns = require('dns').promises;
require('dotenv').config();

// Parse the connection string to extract parts
const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

// Resolve hostname to IPv4 address
let cachedIp = null;

async function getIpv4Address(hostname) {
  if (cachedIp) return cachedIp;
  const lookup = await dns.lookup(hostname, { family: 4 });
  cachedIp = lookup.address;
  return cachedIp;
}

// Create pool with IPv4 override
let pool = null;

async function getPool() {
  if (pool) return pool;
  const ip = await getIpv4Address(config.host);
  console.log(`✅ Resolved ${config.host} → ${ip} (IPv4)`);

  pool = new Pool({
    host: config.host,       // original hostname (for SSL cert validation)
    hostaddr: ip,            // actual IP (for connection)
    port: parseInt(config.port, 10) || 5432,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: { rejectUnauthorized: false }, // or { require: true }
  });
  return pool;
}

// Helper: convert '?' placeholders to PostgreSQL '$1', '$2', ...
function convertPlaceholders(sql, params) {
  if (!params || params.length === 0) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Database functions
const get = async (sql, params = []) => {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

const all = async (sql, params = []) => {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return result.rows;
  } finally {
    client.release();
  }
};

const run = async (sql, params = []) => {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return { lastID: result.rows[0]?.id || null };
  } finally {
    client.release();
  }
};

const close = async () => {
  if (pool) await pool.end();
};

module.exports = {
  get,
  all,
  run,
  close
};
