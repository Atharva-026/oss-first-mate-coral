const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId:  { type: String, required: true, unique: true },
  email:     { type: String, required: true },
  name:      { type: String, required: true },
  avatar:    { type: String },
  hasApiKeys:{ type: Boolean, default: false },
  apiKeys: {
    groqKey:     { type: String, default: '' },
    githubToken: { type: String, default: '' },
    slackToken:  { type: String, default: '' },
  },
  bookmarks: {
    type: [String],
    default: [],
    validate: {
      validator: v => v.length <= 10,
      message: 'Maximum 10 bookmarks allowed'
    }
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);