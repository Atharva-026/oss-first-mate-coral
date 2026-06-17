const express  = require('express');
const router   = express.Router();
const Feedback = require('../models/Feedback');

// ── Auth middlewares (this router is mounted without the global requireAuth
//    because GET /approved is public) ──────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({ error: 'Please log in to submit feedback' });
};

const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in' });
  if (!process.env.ADMIN_EMAIL || req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Only the fields that are safe to expose publicly
const PUBLIC_FIELDS = 'name avatar rating text role githubHandle blogUrl createdAt';

// Trim + cap an optional free-text field
const cleanOptional = (str, max = 200) =>
  (typeof str === 'string' ? str.trim().slice(0, max) : '');

// ── POST /api/feedback (auth) — submit a testimonial ───────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const text   = typeof req.body.text === 'string' ? req.body.text.trim() : '';

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5' });
    }
    if (!text) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: 'Feedback must be 2000 characters or fewer' });
    }

    const feedback = await Feedback.create({
      userId:       req.user._id,
      name:         req.user.name,
      email:        req.user.email,
      avatar:       req.user.avatar || '',
      rating,
      text,
      githubHandle: cleanOptional(req.body.githubHandle, 100),
      role:         cleanOptional(req.body.role, 100),
      blogUrl:      cleanOptional(req.body.blogUrl, 500),
      status:       'pending',
    });

    res.status(201).json({ message: 'Thanks! Your feedback is pending review.', id: feedback._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/feedback/approved (public) — testimonials wall ────────────────
router.get('/approved', async (req, res) => {
  try {
    const items = await Feedback.find({ status: 'approved' })
      .select(PUBLIC_FIELDS)
      .sort({ createdAt: -1 });
    res.json({ feedback: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/feedback/pending (admin) — moderation queue ───────────────────
router.get('/pending', requireAdmin, async (req, res) => {
  try {
    const items = await Feedback.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ feedback: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/feedback/:id/approve (admin) ────────────────────────────────
router.patch('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Approved', feedback: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/feedback/:id (admin) — reject/delete ───────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
