const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userEmail: { type: String, required: true },
  type: { type: String, enum: ['BUG_REPORT', 'SUGGESTION', 'GENERAL'], default: 'GENERAL' },
  message: { type: String, required: true },
  systemContext: { type: String, default: null }, // auto-filled when reported from a platform error
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'], default: 'PENDING' },
  adminReply: { type: String, default: null },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
