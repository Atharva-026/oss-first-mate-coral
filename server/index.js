require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const passport   = require('./config/passport');
const rateLimit  = require('express-rate-limit');
const cron       = require('node-cron');
const connectDB  = require('./config/db');
const User       = require('./models/User');
const { sendFeedbackEmail } = require('./services/emailService');

const app = express();
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

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { error: 'Too many requests. You can make 10 requests per hour.' },
  standardHeaders: true, legacyHeaders: false,
});
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 30,
  message: { error: 'Too many chat messages. Please wait before sending more.' },
  standardHeaders: true, legacyHeaders: false,
});

app.use('/api/triage', apiLimiter);
app.use('/api/duplicates', apiLimiter);
app.use('/api/release-notes', apiLimiter);
app.use('/api/chat', chatLimiter);

connectDB();

const requireAuth = (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({ error: 'Please log in to use OSS First Mate' });
};

app.use('/auth',              require('./routes/auth'));
app.use('/api/chat',          requireAuth, require('./routes/chat'));
app.use('/api/triage',        requireAuth, require('./routes/triage'));
app.use('/api/duplicates',    requireAuth, require('./routes/duplicates'));
app.use('/api/release-notes', requireAuth, require('./routes/releaseNotes'));
app.use('/api/history',       requireAuth, require('./routes/history'));
app.use('/api/slack',         requireAuth, require('./routes/slack'));
app.use('/api/settings',      requireAuth, require('./routes/settings'));
app.use('/api/bookmarks',     requireAuth, require('./routes/bookmarks'));
// Feedback router handles its own auth per-route (GET /approved is public).
app.use('/api/feedback',      require('./routes/feedback'));
// Analytics router handles its own auth per-route (POST /visit is public,
// GET /summary is admin-gated).
app.use('/api/analytics',     require('./routes/analytics'));

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
