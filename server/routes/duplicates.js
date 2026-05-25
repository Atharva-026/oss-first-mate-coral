const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/coralService');
const { findDuplicates } = require('../services/groqService');
const RunHistory = require('../models/RunHistory');

router.post('/', async (req, res) => {
  const { owner, repo } = req.body;

  const sql = `SELECT number, title, body, labels, created_at FROM github.issues WHERE owner = '${owner}' AND repo = '${repo}' AND state = 'open' ORDER BY created_at DESC LIMIT 20`;

  try {
    const rawIssues = await runQuery(sql);
    const trimmed = rawIssues.map(i => ({
      ...i,
      body: i.body ? i.body.slice(0, 150) : ''
    }));
    const duplicates = await findDuplicates(trimmed);

    await RunHistory.create({
      type: 'duplicates',
      repo: `${owner}/${repo}`,
      sqlQuery: sql.trim(),
      resultCount: duplicates.length,
    });

    res.json({ duplicates, sqlQuery: sql.trim(), total: rawIssues.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;