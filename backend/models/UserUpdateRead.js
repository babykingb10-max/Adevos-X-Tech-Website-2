const mongoose = require('mongoose');

const userUpdateReadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Update', required: true },
  isRead: { type: Boolean, default: false },
  isPoppedUp: { type: Boolean, default: false }
}, { timestamps: true });

userUpdateReadSchema.index({ userId: 1, updateId: 1 }, { unique: true });

module.exports = mongoose.model('UserUpdateRead', userUpdateReadSchema);
