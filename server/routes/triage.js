const express  = require('express');
const router   = express.Router();
const { runQuery }      = require('../services/coralService');
const { analyzeIssues } = require('../services/groqService');
const { decrypt }       = require('../services/cryptoService');
const RunHistory        = require('../models/RunHistory');
const User              = require('../models/User');

const sanitize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[^a-zA-Z0-9_.\-]/g, '');
};

router.post('/', async (req, res) => {
  const owner = sanitize(req.body.owner);
  const repo  = sanitize(req.body.repo);

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Invalid owner or repo name' });
  }

  // Get user's own API keys
  const user      = await User.findById(req.user._id);
  const groqKey   = decrypt(user.apiKeys?.groqKey);
  const githubToken = decrypt(user.apiKeys?.githubToken);

  if (!groqKey || !githubToken) {
    return res.status(403).json({ error: 'API keys not configured. Please add your keys in Settings.' });
  }

  // Inject user's GitHub token into env for Coral (Coral reads GITHUB_TOKEN)
  const originalToken = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = githubToken;

  const sql = `SELECT number, title, body, labels, created_at, state FROM github.issues WHERE owner = '${owner}' AND repo = '${repo}' AND state = 'open' ORDER BY created_at DESC LIMIT 10`;

  try {
    const rawIssues = await runQuery(sql);
    process.env.GITHUB_TOKEN = originalToken; // restore

    const trimmed  = rawIssues.map(i => ({ ...i, body: i.body ? i.body.slice(0, 150) : '' }));
    const analyzed = await analyzeIssues(trimmed, groqKey);

    await RunHistory.create({
      userId:      req.user._id,
      type:        'triage',
      repo:        `${owner}/${repo}`,
      sqlQuery:    sql.trim(),
      resultCount: rawIssues.length,
    });

    res.json({ issues: analyzed, sqlQuery: sql.trim(), total: rawIssues.length });
  } catch (err) {
    process.env.GITHUB_TOKEN = originalToken;
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;