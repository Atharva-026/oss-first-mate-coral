const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId:  { type: String, required: true, unique: true },
  email:     { type: String, required: true },
  name:      { type: String, required: true },
  avatar:    { type: String },
  hasApiKeys:{ type: Boolean, default: false }, // flag to check on login
  apiKeys: {
    groqKey:      { type: String, default: '' }, // encrypted
    githubToken:  { type: String, default: '' }, // encrypted
    slackToken:   { type: String, default: '' }, // encrypted, optional
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);