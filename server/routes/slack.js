
const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/coralService');
const { getChannelMessages, notifyIssueResolved } = require('../services/slackService');
const { analyzeSlackGithubLinks } = require('../services/groqService');
const RunHistory = require('../models/RunHistory');

// Strip anything that could break out of the SQL string literal below.
// Same allow-list used by the triage/duplicates/release-notes routes.
const sanitize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[^a-zA-Z0-9_.\-]/g, '');
};

router.post('/', async (req, res) => {
  const owner   = sanitize(req.body.owner);
  const repo    = sanitize(req.body.repo);
  const channel = sanitize(req.body.channel) || 'github-issues';

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Invalid owner or repo name' });
  }

  try {
    const sql = `SELECT number, title, body FROM github.issues WHERE owner = '${owner}' AND repo = '${repo}' AND state = 'open' ORDER BY created_at DESC LIMIT 10`;

    const [issues, messages] = await Promise.all([
      runQuery(sql),
      getChannelMessages(channel)
    ]);

    const linked = await analyzeSlackGithubLinks(issues, messages);

    await RunHistory.create({
      userId: req.user._id,
      type: 'triage',
      repo: `${owner}/${repo}`,
      sqlQuery: sql,
      resultCount: linked.length,
    });

    res.json({ linked, sqlQuery: sql, messageCount: messages.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/resolve', async (req, res) => {
  const { issueNumber, issueTitle, resolvedBy, channel } = req.body;
  try {
    await notifyIssueResolved(issueNumber, issueTitle, resolvedBy || 'a contributor', channel);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;