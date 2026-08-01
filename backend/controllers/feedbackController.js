const Feedback = require('../models/Feedback');
const { sendMail, feedbackReplyEmail } = require('../utils/mailer');

// POST /feedback — public (works for guests and logged-in users)
exports.sendFeedback = async (req, res, next) => {
  try {
    const { email, type, message, systemContext } = req.body;
    const userEmail = email || req.user?.email;
    if (!userEmail || !message) return res.status(400).json({ message: 'Email and message are required.' });

    const feedback = await Feedback.create({
      userId: req.user?._id || null,
      userEmail,
      type: ['BUG_REPORT', 'SUGGESTION', 'GENERAL'].includes(type) ? type : 'GENERAL',
      message,
      systemContext: systemContext || null
    });

    if (process.env.ADMIN_NOTIFY_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_NOTIFY_EMAIL,
        subject: `New ${feedback.type.replace('_', ' ')} from ${userEmail}`,
        html: `<p><strong>From:</strong> ${userEmail}</p><p><strong>Type:</strong> ${feedback.type}</p><p>${message}</p>${systemContext ? `<p><em>${systemContext}</em></p>` : ''}`
      });
    }

    res.status(201).json({ message: 'Feedback received.' });
  } catch (err) { next(err); }
};

// ---- Admin-only ----

// GET /admin/feedback
exports.listFeedback = async (req, res, next) => {
  try {
    const items = await Feedback.find().sort('-createdAt');
    res.json(items);
  } catch (err) { next(err); }
};

// POST /admin/feedback/:id/reply
exports.replyFeedback = async (req, res, next) => {
  try {
    const { replyText } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });

    feedback.adminReply = replyText;
    feedback.status = 'RESOLVED';
    feedback.resolvedAt = new Date();
    await feedback.save();

    await sendMail({ to: feedback.userEmail, subject: 'Update on your feedback — Adevos-X Tech', html: feedbackReplyEmail(feedback.userEmail.split('@')[0], replyText) });
    res.json({ message: 'Reply sent.', feedback });
  } catch (err) { next(err); }
};
