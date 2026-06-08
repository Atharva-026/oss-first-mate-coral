require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const passport   = require('./config/passport');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => { res.setTimeout(120000); next(); });

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
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
app.use('/api/chat',          require('./routes/chat'));
app.use('/api/triage',        requireAuth, require('./routes/triage'));
app.use('/api/duplicates',    requireAuth, require('./routes/duplicates'));
app.use('/api/release-notes', requireAuth, require('./routes/releaseNotes'));
app.use('/api/history',       requireAuth, require('./routes/history'));
app.use('/api/slack',         requireAuth, require('./routes/slack'));
app.use('/api/settings',      requireAuth, require('./routes/settings'));
app.use('/api/bookmarks',     requireAuth, require('./routes/bookmarks'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));