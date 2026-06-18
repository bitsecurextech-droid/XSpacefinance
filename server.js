console.log('🔍 DATABASE_URL (first 30 chars):', process.env.DATABASE_URL?.slice(0, 30));
console.log('🔍 DATABASE_URL length:', process.env.DATABASE_URL?.length);require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const helmet = require('helmet');
const flash = require('connect-flash');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// =============================================
// 1. PostgreSQL connection pool for sessions
// =============================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Supabase
});

// =============================================
// 2. Create session table (if not exists)
// =============================================
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log('✅ Session table is ready');
  } catch (err) {
    console.error('❌ Failed to create session table:', err.message);
  } finally {
    client.release();
  }
})();

// =============================================
// 3. App configuration
// =============================================
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure upload directories exist
const fs = require('fs');
const uploadDirs = ['public/uploads', 'public/uploads/deposits', 'public/uploads/kyc'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// =============================================
// 4. Session store (PostgreSQL)
// =============================================
const sessionStore = new pgSession({
  pool: pool,
  tableName: 'session', // table name – must match the one we created
  createTableIfMissing: false // we already created it above
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

app.use(flash());

// =============================================
// 5. Global user middleware (using PostgreSQL)
// =============================================
app.use(async (req, res, next) => {
  res.locals.isLoggedIn = false;
  res.locals.user = null;
  res.locals.isAdmin = false;
  res.locals.messages = req.flash();

  if (req.session && req.session.userId) {
    try {
      const user = await db.get(
        'SELECT id, first_name, last_name, email, balance, currency, is_admin, kyc_status, referral_code FROM users WHERE id = ?',
        [req.session.userId]
      );
      if (user) {
        res.locals.user = user;
        res.locals.isLoggedIn = true;
        res.locals.isAdmin = user.is_admin === 1;
      }
    } catch (error) {
      console.error('Session user error:', error);
    }
  }
  next();
});

// =============================================
// 6. View engine & routes
// =============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/api', apiRoutes);
app.use('/dashboard', userRoutes);
app.use('/admin', adminRoutes);

// =============================================
// 7. Error handling
// =============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', {
    message: 'Something went wrong. Please try again later.',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found', error: { status: 404 } });
});

// =============================================
// 8. Start server
// =============================================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 XSpaceFinance Server is running!                    ║
║                                                          ║
║   📡 Port: ${PORT}                                          ║
║   🌍 URL: http://localhost:${PORT}                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// =============================================
// 9. Currency helper
// =============================================
app.locals.formatCurrency = function(amount, currency) {
  if (!currency) currency = 'GBP';
  if (!amount) amount = 0;
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
};

// =============================================
// 10. Keep-alive cron (production only)
// =============================================
const cron = require('node-cron');

if (process.env.NODE_ENV === 'production') {
  cron.schedule('*/5 * * * *', () => {
    const url = process.env.BASE_URL || 'https://your-app.onrender.com';
    fetch(url)
      .then(() => console.log('🔋 Keep-alive ping sent'))
      .catch(() => console.log('⚠️ Keep-alive ping failed'));
  });
}

// =============================================
// 11. Graceful shutdown
// =============================================
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  await pool.end();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down...');
  await pool.end();
  process.exit(0);
});

console.log('DATABASE_URL exists?', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.slice(0, 20));
