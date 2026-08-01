const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  fullContent: { type: String, required: true },
  category: { type: String, enum: ['SYSTEM_MAINTENANCE', 'NEW_FEATURE', 'OFFER_BONUS', 'IMPORTANT_NOTICE'], default: 'NEW_FEATURE' },
  isPublished: { type: Boolean, default: true },
  allowPopup: { type: Boolean, default: true },
  popupTarget: { type: String, enum: ['ALL', 'USER_PLAN', 'DEPLOYER_PLAN'], default: 'ALL' },
  seenByCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Update', updateSchema);
