require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const passport   = require('./config/passport');
const cron       = require('node-cron');
const connectDB  = require('./config/db');
const User       = require('./models/User');
const { sendFeedbackEmail } = require('./services/emailService');
const {
  expensiveLimiter,
  standardLimiter,
  authLimiter,
  visitLimiter,
} = require('./middleware/rateLimiters');

const app = express();
// Behind a single Nginx hop (Docker on EC2). Trust exactly one proxy so
// express-rate-limit keys on the real client IP via X-Forwarded-For, not the
// proxy's IP. `trust proxy: true` (blanket) is avoided — it lets clients spoof
// X-Forwarded-For and bypass rate limiting.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => { res.setTimeout(120000); next(); });

if (!process.env.SESSION_SECRET) {
  console.warn('[security] SESSION_SECRET is not set — using an insecure default. Set SESSION_SECRET in the environment.');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  // `secure` stays false by default so the cookie keeps working over plain HTTP.
  // Once the site is served over HTTPS, set COOKIE_SECURE=true to harden it.
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
  }
}));

app.use(passport.initialize());
app.use(passport.session());

connectDB();

const requireAuth = (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({ error: 'Please log in to use OSS First Mate' });
};

// Auth routes — stricter limiter to curb login/OAuth abuse.
app.use('/auth',              authLimiter, require('./routes/auth'));

// AI/API-heavy routes (Groq/GitHub) — tight expensive limiter (20/15min).
app.use('/api/chat',          expensiveLimiter, requireAuth, require('./routes/chat'));
app.use('/api/triage',        expensiveLimiter, requireAuth, require('./routes/triage'));
app.use('/api/duplicates',    expensiveLimiter, requireAuth, require('./routes/duplicates'));
app.use('/api/release-notes', expensiveLimiter, requireAuth, require('./routes/releaseNotes'));
app.use('/api/slack',         expensiveLimiter, requireAuth, require('./routes/slack'));

// Normal authenticated routes — standard limiter (100/15min).
app.use('/api/history',       standardLimiter, requireAuth, require('./routes/history'));
app.use('/api/settings',      standardLimiter, requireAuth, require('./routes/settings'));
app.use('/api/bookmarks',     standardLimiter, requireAuth, require('./routes/bookmarks'));
// Feedback router handles its own auth per-route (GET /approved is public).
app.use('/api/feedback',      standardLimiter, require('./routes/feedback'));
// Analytics router handles its own auth per-route (POST /visit is public,
// GET /summary is admin-gated). The public visit endpoint gets its own
// stricter limiter (60/15min) so it can't be spammed; everything else on the
// router uses the standard limiter. Each request is routed to exactly one
// limiter to avoid double-counting against two buckets.
app.use('/api/analytics', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/visit') return visitLimiter(req, res, next);
  return standardLimiter(req, res, next);
}, require('./routes/analytics'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// ── Daily feedback-email cron ──────────────────────────────────────────────
// Every day at 09:00 server time, email users who signed up more than a day
// ago and haven't yet received a feedback request.
const sendPendingFeedbackEmails = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const users = await User.find({
      feedbackEmailSent: false,
      createdAt: { $lt: oneDayAgo },
    });
    if (!users.length) return;
    console.log(`[cron] Sending feedback email to ${users.length} user(s)`);
    for (const user of users) {
      await sendFeedbackEmail(user.email, (user.name || '').split(' ')[0] || 'there');
      user.feedbackEmailSent = true;
      await user.save();
    }
  } catch (err) {
    console.error('[cron] Feedback email job failed:', err.message);
  }
};

cron.schedule('0 9 * * *', sendPendingFeedbackEmails);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
