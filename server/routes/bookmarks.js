const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

const sanitize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[^a-zA-Z0-9_.\-\/]/g, '');
};

// Get all bookmarks
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ bookmarks: user.bookmarks || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add bookmark
router.post('/', async (req, res) => {
  const repo = sanitize(req.body.repo);
  if (!repo || !repo.includes('/')) {
    return res.status(400).json({ error: 'Invalid repo format. Use owner/repo' });
  }
  try {
    const user = await User.findById(req.user._id);
    if (user.bookmarks.length >= 10) {
      return res.status(400).json({ error: 'Maximum 10 bookmarks allowed. Remove one first.' });
    }
    if (user.bookmarks.includes(repo)) {
      return res.status(400).json({ error: 'Already bookmarked' });
    }
    user.bookmarks.push(repo);
    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove bookmark
router.delete('/', async (req, res) => {
  const repo = sanitize(req.body.repo);
  try {
    const user = await User.findById(req.user._id);
    user.bookmarks = user.bookmarks.filter(b => b !== repo);
    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;