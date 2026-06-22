const rateLimit = require('express-rate-limit');

// Shared window for all limiters: 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;

// Standard JSON error body returned with status 429 when a limit is exceeded.
const tooManyRequests = { error: 'Too many requests, please try again in a few minutes.' };

// Key authenticated limiters by the logged-in user's ID so users behind a
// shared public IP (e.g. judges on one conference/office NAT) each get their
// own bucket. Falls back to IP for unauthenticated requests. This only works
// because the global passport.session() middleware populates req.user BEFORE
// these limiters run (see server/index.js).
const userOrIp = (req) => String(req.user?.id || req.user?._id || req.ip);

// ── expensiveLimiter ───────────────────────────────────────────────────────
// AI/API-heavy routes (triage, duplicates, release notes, slack insights,
// chat). These hit Groq/GitHub and cost money/quota, so keep them tight.
const expensiveLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 20, // 20 requests per 15 minutes per user (IP fallback)
  message: tooManyRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIp,
});

// ── standardLimiter ────────────────────────────────────────────────────────
// Normal authenticated routes (history, bookmarks, feedback, analytics).
// Cheap reads/writes, so a more generous ceiling.
const standardLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 100, // 100 requests per 15 minutes per user (IP fallback)
  message: tooManyRequests,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIp,
});

// ── authLimiter ────────────────────────────────────────────────────────────
// Auth routes — prevents login/OAuth abuse.
const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 30, // 30 requests per 15 minutes per IP
  message: tooManyRequests,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── visitLimiter ───────────────────────────────────────────────────────────
// Public, unauthenticated analytics visit endpoint (POST /api/analytics/visit).
// Stricter than standard since anyone can hit it without logging in.
const visitLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 60, // 60 requests per 15 minutes per IP
  message: tooManyRequests,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  expensiveLimiter,
  standardLimiter,
  authLimiter,
  visitLimiter,
};
