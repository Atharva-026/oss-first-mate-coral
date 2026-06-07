const mongoose = require('mongoose');

const RunHistorySchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:        { type: String, enum: ['triage', 'duplicates', 'release-notes'], required: true },
  repo:        { type: String, required: true },
  sqlQuery:    { type: String },
  resultCount: { type: Number },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('RunHistory', RunHistorySchema);