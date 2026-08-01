const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const CoinTransaction = require('../models/CoinTransaction');
const { maskEmail } = require('../utils/coins');

function generateCode(name) {
  const base = (name || 'ADEVOS').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'ADEVOS';
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// GET /coins/wallet
exports.getWallet = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findOne({ userId: req.user._id });
    const referrals = affiliate ? await User.find({ referredBy: req.user._id }) : [];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const earnedThisMonth = await CoinTransaction.aggregate([
      { $match: { userId: req.user._id, amount: { $gt: 0 }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      balance: req.user.coinsBalance,
      referralCode: affiliate?.referralCode || null,
      totalReferrals: referrals.length,
      earnedThisMonth: earnedThisMonth[0]?.total || 0
    });
  } catch (err) { next(err); }
};

// POST /coins/referral/generate
exports.generateReferralLink = async (req, res, next) => {
  try {
    const existing = await Affiliate.findOne({ userId: req.user._id });
    if (existing) return res.status(409).json({ message: 'You already have a referral link.' });

    const { fullName, phoneNumber, preferredPlatform } = req.body;
    if (!fullName) return res.status(400).json({ message: 'Full name is required.' });

    let referralCode;
    let attempts = 0;
    do {
      referralCode = generateCode(fullName);
      attempts++;
    } while (await Affiliate.findOne({ referralCode }) && attempts < 10);

    const affiliate = await Affiliate.create({ userId: req.user._id, fullName, phoneNumber, preferredPlatform, referralCode });
    res.status(201).json(affiliate);
  } catch (err) { next(err); }
};

// GET /coins/referral/history
exports.getReferralHistory = async (req, res, next) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id }).sort('-createdAt');
    const history = referrals.map(u => ({
      maskedEmail: maskEmail(u.email),
      verified: u.emailVerified,
      coinsAwarded: u.emailVerified ? 50 : 0
    }));
    res.json(history);
  } catch (err) { next(err); }
};

// GET /coins/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const top = await User.aggregate([
      { $match: { referredBy: { $ne: null } } },
      { $group: { _id: '$referredBy', invites: { $sum: 1 } } },
      { $sort: { invites: -1 } },
      { $limit: 5 }
    ]);
    const populated = await User.populate(top, { path: '_id', select: 'name' });
    res.json(populated.map(t => ({ name: t._id?.name || 'Adevos User', invites: t.invites })));
  } catch (err) { next(err); }
};
