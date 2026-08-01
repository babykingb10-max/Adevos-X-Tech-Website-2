const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

/**
 * Adjusts a user's coin balance and records a ledger entry in one call,
 * so the wallet balance and the transaction history can never drift apart.
 */
async function adjustCoins(userId, amount, reason, { relatedUserEmail = null, note = '' } = {}) {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found.' };

  const newBalance = user.coinsBalance + amount;
  if (newBalance < 0) throw { status: 400, message: 'Insufficient coin balance.' };

  user.coinsBalance = newBalance;
  await user.save();

  await CoinTransaction.create({ userId, amount, reason, relatedUserEmail, note });
  return user.coinsBalance;
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

module.exports = { adjustCoins, maskEmail };
