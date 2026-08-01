const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },  // e.g. "Updated Slide #1", "Deleted bot bot_555"
  targetType: { type: String, default: '' }, // 'Slide' | 'UserBot' | 'User' | ...
  targetId: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);

