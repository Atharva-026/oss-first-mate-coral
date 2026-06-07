const express = require('express');
const router = express.Router();
const axios = require('axios');
const { runQuery } = require('../services/coralService');
const { generateReleaseNotes } = require('../services/groqService');
const RunHistory = require('../models/RunHistory');

const sanitize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[^a-zA-Z0-9_.\-]/g, '');
};

router.post('/', async (req, res) => {
  const owner = sanitize(req.body.owner);
  const repo = sanitize(req.body.repo);

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Invalid owner or repo name' });
  }

  const sql = `SELECT number, title, body, merged_at, labels FROM github.pulls WHERE owner = '${owner}' AND repo = '${repo}' AND state = 'closed' ORDER BY number DESC LIMIT 15`;

  let rawPRs = [];
  let usedCoral = false;

  // Try Coral first
  try {
    const coralResults = await runQuery(sql);
    if (coralResults && coralResults.length > 0) {
      rawPRs = coralResults.map(pr => ({
        number: pr.number,
        title: pr.title,
        body: pr.body ? pr.body.slice(0, 150) : '',
        merged_at: pr.merged_at,
        labels: Array.isArray(pr.labels) ? pr.labels : []
      }));
      usedCoral = true;
    }
  } catch (coralErr) {
    console.log('Coral failed for release notes, falling back to GitHub API:', coralErr.message);
  }

  // Fallback to GitHub REST API if Coral returned nothing
  if (rawPRs.length === 0) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json'
          },
          params: { state: 'closed', per_page: 15, sort: 'updated', direction: 'desc' }
        }
      );
      rawPRs = response.data.map(pr => ({
        number: pr.number,
        title: pr.title,
        body: pr.body ? pr.body.slice(0, 150) : '',
        merged_at: pr.merged_at,
        labels: pr.labels.map(l => l.name)
      }));
    } catch (apiErr) {
      return res.status(500).json({ error: apiErr.message });
    }
  }

  try {
    const notes = await generateReleaseNotes(rawPRs);

    await RunHistory.create({
      type: 'release-notes',
      repo: `${owner}/${repo}`,
      sqlQuery: sql,
      resultCount: rawPRs.length,
    });

    res.json({ notes, sqlQuery: sql, prCount: rawPRs.length, usedCoral });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;