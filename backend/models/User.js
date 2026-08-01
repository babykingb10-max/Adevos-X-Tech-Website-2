const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, default: null },
  appleId: { type: String, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: null }, // null for OAuth-only accounts
  profilePic: { type: String, default: null },
  emailVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },

  subscription: {
    status: { type: String, enum: ['INACTIVE', 'ACTIVE'], default: 'INACTIVE' },
    plan: { type: String, enum: ['USER', 'DEPLOYER'], default: 'USER' },
    expiresAt: { type: Date, default: null }
  },

  coinsBalance: { type: Number, default: 0 },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  status: { type: String, enum: ['ACTIVE', 'BANNED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
