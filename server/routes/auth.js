const router  = require('express').Router();
const passport = require('passport');

// Step 1: redirect user to Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Google redirects back here
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}?error=auth_failed` }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);

// Get logged-in user info (called by frontend on load)
router.get('/me', (req, res) => {
  if (req.user) return res.json(req.user);
  res.status(401).json({ error: 'Not logged in' });
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
});

module.exports = router;