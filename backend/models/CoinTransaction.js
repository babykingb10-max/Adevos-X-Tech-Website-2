const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // positive = credit, negative = debit
  reason: { type: String, required: true }, // 'REFERRAL_BONUS' | 'WELCOME_BONUS' | 'DEPLOYMENT_PAYMENT' | 'ADMIN_ADJUSTMENT'
  relatedUserEmail: { type: String, default: null }, // masked email of referred user, if applicable
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
