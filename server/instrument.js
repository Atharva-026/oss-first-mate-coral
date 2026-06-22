// Sentry must initialize before any other module is required (v8+ relies on
// loading first to auto-instrument http/express). Because this file is required
// at the very top of index.js — before its own dotenv.config() runs — we load
// the env here too so SENTRY_DSN is available. dotenv is idempotent, so the
// later config() call in index.js is harmless.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Sentry = require("@sentry/node");

// Only init when a DSN is present, so local dev without Sentry doesn't break.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
}

module.exports = Sentry;
