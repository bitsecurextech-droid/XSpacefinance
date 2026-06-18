// database.js – PostgreSQL with forced IPv4
const { Pool } = require('pg');
const dns = require('dns').promises;
require('dotenv').config();

const parse = require('pg-connection-string').parse;
const config = parse(process.env.DATABASE_URL);

let cachedIp = null;
async function getIpv4Address(hostname) {
  if (cachedIp) return cachedIp;
  const lookup = await dns.lookup(hostname, { family: 4 });
  cachedIp = lookup.address;
  console.log(`✅ Resolved ${hostname} → ${cachedIp} (IPv4)`);
  return cachedIp;
}

let pool = null;
async function getPool() {
  if (pool) return pool;
  const ip = await getIpv4Address(config.host);
  pool = new Pool({
    host: config.host,
    hostaddr: ip,          // use IPv4 address
    port: parseInt(config.port, 10) || 5432,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: { rejectUnauthorized: false },
  });
  return pool;
}

function convertPlaceholders(sql, params) {
  if (!params || params.length === 0) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

const get = async (sql, params = []) => {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return result.rows[0] || null;
  } finally { client.release(); }
};

const all = async (sql, params = []) => {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return result.rows;
  } finally { client.release(); }
};

const run = async (sql, params = []) => {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(convertPlaceholders(sql, params), params);
    return { lastID: result.rows[0]?.id || null };
  } finally { client.release(); }
};

const close = async () => { if (pool) await pool.end(); };

module.exports = { get, all, run, close };
