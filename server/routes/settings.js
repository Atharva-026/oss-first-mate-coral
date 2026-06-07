const router  = require('express').Router();
const User    = require('../models/User');
const { encrypt, decrypt } = require('../services/cryptoService');

// Save / update API keys
router.put('/keys', async (req, res) => {
  const { groqKey, githubToken, slackToken } = req.body;

  if (!groqKey || !githubToken) {
    return res.status(400).json({ error: 'Groq API key and GitHub token are required' });
  }

  try {
    await User.findByIdAndUpdate(req.user._id, {
      hasApiKeys: true,
      apiKeys: {
        groqKey:     encrypt(groqKey),
        githubToken: encrypt(githubToken),
        slackToken:  slackToken ? encrypt(slackToken) : '',
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get keys — masked for display (never return raw keys to frontend)
router.get('/keys', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const mask = (val) => {
      const dec = decrypt(val);
      if (!dec) return '';
      return dec.slice(0, 6) + '••••••••••••' + dec.slice(-4);
    };
    res.json({
      hasApiKeys:  user.hasApiKeys,
      groqKey:     mask(user.apiKeys?.groqKey),
      githubToken: mask(user.apiKeys?.githubToken),
      slackToken:  mask(user.apiKeys?.slackToken),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;