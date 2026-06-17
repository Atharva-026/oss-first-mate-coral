const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  path:      { type: String, default: '/' },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
});

module.exports = mongoose.model('Visit', VisitSchema);
