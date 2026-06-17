const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const Feedback   = require('../models/Feedback');
const RunHistory = require('../models/RunHistory');
const Visit      = require('../models/Visit');

// ── Admin gate (same pattern as routes/feedback.js) ────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in' });
  if (!process.env.ADMIN_EMAIL || req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Format a Date as YYYY-MM-DD (UTC) for stable day bucketing
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

// ── POST /api/analytics/visit (PUBLIC) — log a single visit ────────────────
router.post('/visit', async (req, res) => {
  try {
    const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 200) : '/';
    const userAgent = (req.headers['user-agent'] || '').slice(0, 300);
    await Visit.create({ path, userAgent });
    res.status(201).json({ ok: true });
  } catch (err) {
    // Visit logging should never break the page — swallow but report
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/analytics/summary (admin) — dashboard metrics ─────────────────
router.get('/summary', requireAdmin, async (req, res) => {
  try {
    const now      = Date.now();
    const days7    = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const days30   = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersWithApiKeys,
      newUsersLast7Days,
      newUsersLast30Days,
      totalVisits,
      visitsLast7Days,
      totalFeedback,
      approvedFeedback,
      pendingFeedback,
      totalRuns,
      runTypeAgg,
      topReposAgg,
      recentSignups,
      userList,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ hasApiKeys: true }),
      User.countDocuments({ createdAt: { $gte: days7 } }),
      User.countDocuments({ createdAt: { $gte: days30 } }),
      Visit.countDocuments({}),
      Visit.countDocuments({ timestamp: { $gte: days7 } }),
      Feedback.countDocuments({}),
      Feedback.countDocuments({ status: 'approved' }),
      Feedback.countDocuments({ status: 'pending' }),
      RunHistory.countDocuments({}),
      RunHistory.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      RunHistory.aggregate([
        { $group: { _id: '$repo', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Last 14 days of signups, raw — bucketed in JS for timezone-stable days
      User.find({ createdAt: { $gte: new Date(now - 14 * 24 * 60 * 60 * 1000) } })
        .select('createdAt')
        .lean(),
      // Roster of signed-up users (admin-only view) — newest first, capped
      User.find({})
        .select('email name avatar hasApiKeys createdAt')
        .sort({ createdAt: -1 })
        .limit(500)
        .lean(),
    ]);

    // runsByType — map stored enum to the requested shape; slack isn't stored
    // as its own type (the slack route logs as 'triage'), so it defaults to 0.
    const typeCounts = runTypeAgg.reduce((acc, r) => {
      acc[r._id] = r.count;
      return acc;
    }, {});
    const runsByType = {
      triage:       typeCounts['triage']        || 0,
      duplicates:   typeCounts['duplicates']    || 0,
      releaseNotes: typeCounts['release-notes'] || 0,
      slack:        typeCounts['slack']         || 0,
    };

    // signupsByDay — last 14 days, zero-filled
    const counts = recentSignups.reduce((acc, u) => {
      const k = dayKey(u.createdAt);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const signupsByDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const k = dayKey(d);
      signupsByDay.push({ date: k, count: counts[k] || 0 });
    }

    const topRepos = topReposAgg.map(r => ({ repo: r._id, count: r.count }));

    const users = userList.map(u => ({
      email:      u.email,
      name:       u.name,
      avatar:     u.avatar || '',
      hasApiKeys: !!u.hasApiKeys,
      createdAt:  u.createdAt,
    }));

    res.json({
      totalUsers,
      usersWithApiKeys,
      newUsersLast7Days,
      newUsersLast30Days,
      signupsByDay,
      totalVisits,
      visitsLast7Days,
      totalFeedback,
      approvedFeedback,
      pendingFeedback,
      totalRuns,
      runsByType,
      topRepos,
      users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
