require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
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

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const fs = require('fs');
const uploadDirs = ['public/uploads', 'public/uploads/deposits', 'public/uploads/kyc'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const sessionStore = new SQLiteStore({ db: 'sessions.db', concurrentDB: true });
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/api', apiRoutes);
app.use('/dashboard', userRoutes);
app.use('/admin', adminRoutes);

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

app.locals.formatCurrency = function(amount, currency) {
  if (!currency) currency = 'GBP';
  if (!amount) amount = 0;
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
};

const cron = require('node-cron');

// Keep alive: ping every 5 minutes
if (process.env.NODE_ENV === 'production') {
  cron.schedule('*/5 * * * *', () => {
    const url = process.env.BASE_URL || 'https://your-app.onrender.com';
    fetch(url)
      .then(() => console.log('🔋 Keep-alive ping sent'))
      .catch(() => console.log('⚠️ Keep-alive ping failed'));
  });
}

process.on('SIGINT', () => { console.log('🛑 Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { console.log('🛑 Shutting down...'); process.exit(0); });