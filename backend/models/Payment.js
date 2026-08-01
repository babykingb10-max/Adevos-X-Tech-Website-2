const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  context: { type: String, enum: ['BOT_DEPLOYMENT', 'DEPLOYER_UPGRADE'], required: true },
  plan: { type: String, required: true },       // 'Wiki 2' | 'Wiki 4' ...
  amount: { type: Number, required: true },
  method: { type: String, enum: ['MANUAL', 'PAYSTACK', 'COINS'], required: true },
  transactionRef: { type: String, default: null },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'FAILED'], default: 'PENDING' },
  paidAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
