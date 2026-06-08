const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email:    profile.emails[0].value,
        name:     profile.displayName,
        avatar:   profile.photos?.[0]?.value || '',
      });
    }

    // Send welcome email on every login temporarily for debugging
    if (true) {
      console.log('New user detected, sending welcome email to:', user.email)
      sendWelcomeEmail(user.email, user.name.split(' ')[0])
        .then(() => console.log('Email sent successfully'))
        .catch(err => console.error('Email error:', err.message))
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

module.exports = passport;