const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  email:        { type: String, required: true },
  avatar:       { type: String, default: '' },
  rating:       { type: Number, required: true, min: 1, max: 5 },
  text:         { type: String, required: true, maxlength: 2000 },
  githubHandle: { type: String, default: '' },
  role:         { type: String, default: '' },
  blogUrl:      { type: String, default: '' },
  status:       { type: String, enum: ['pending', 'approved'], default: 'pending' },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
