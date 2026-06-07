const express = require('express');
const router  = express.Router();
const RunHistory = require('../models/RunHistory');

router.get('/', async (req, res) => {
  try {
    const runs = await RunHistory
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;