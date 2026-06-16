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
// Only expose the fields the client actually needs — never the googleId or
// the encrypted apiKeys blobs stored on the user document.
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in' });
  const { _id, name, email, avatar, hasApiKeys } = req.user;
  res.json({ _id, name, email, avatar, hasApiKeys });
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
});

module.exports = router;