const express = require('express');
const router = express.Router();
const { runQuery } = require('../services/coralService');
const { generateReleaseNotes } = require('../services/groqService');
const RunHistory = require('../models/RunHistory');

router.post('/', async (req, res) => {
  const { owner, repo } = req.body;

  const sql = `SELECT number, title, body, merged_at, labels FROM github.pulls WHERE owner = '${owner}' AND repo = '${repo}' AND state = 'closed' ORDER BY number DESC LIMIT 10`;

  try {
    const rawPRs = await runQuery(sql);
    const trimmed = rawPRs.map(pr => ({
      number: pr.number,
      title: pr.title,
      body: pr.body ? pr.body.slice(0, 100) : '',
      labels: pr.labels
    }));
    const notes = await generateReleaseNotes(trimmed);

    await RunHistory.create({
      type: 'release-notes',
      repo: `${owner}/${repo}`,
      sqlQuery: sql,
      resultCount: rawPRs.length,
    });

    res.json({ notes, sqlQuery: sql, prCount: rawPRs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;