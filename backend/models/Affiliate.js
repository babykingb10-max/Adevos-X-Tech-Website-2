const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  preferredPlatform: { type: String, default: '' },
  referralCode: { type: String, required: true, unique: true },
  linkStatus: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Affiliate', affiliateSchema);
