const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserBot = require('../models/UserBot');
const BotTemplate = require('../models/BotTemplate');
const SiteConfig = require('../models/SiteConfig');
const Slide = require('../models/Slide');
const HomepageCard = require('../models/HomepageCard');
const DeploymentPlatform = require('../models/DeploymentPlatform');
const AdminActionLog = require('../models/AdminActionLog');
const Affiliate = require('../models/Affiliate');
const { adjustCoins } = require('../utils/coins');
const { getPlatformClient } = require('../utils/platformClients');

async function logAction(adminId, action, targetType = '', targetId = '') {
  await AdminActionLog.create({ adminId, action, targetType, targetId });
}

// POST /admin/login — username/password only, separate from public Google/Apple/email flow
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await User.findOne({ $or: [{ email: (username || '').toLowerCase() }, { name: username }], role: 'ADMIN' });
    if (!admin || !admin.passwordHash) return res.status(401).json({ message: 'Incorrect username or password.' });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Incorrect username or password.' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) { next(err); }
};

// GET /admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, activeBots, coinsIssued] = await Promise.all([
      User.countDocuments(),
      UserBot.countDocuments({ status: 'ACTIVE' }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$coinsBalance' } } }])
    ]);
    res.json({ totalUsers, activeBots, coinsIssued: coinsIssued[0]?.total || 0 });
  } catch (err) { next(err); }
};

// ---------- Site Config ----------
exports.updateSiteConfig = async (req, res, next) => {
  try {
    const config = await SiteConfig.findOneAndUpdate({ key: 'GLOBAL' }, req.body, { new: true, upsert: true });
    await logAction(req.user._id, 'Updated global site configuration', 'SiteConfig', 'GLOBAL');
    res.json(config);
  } catch (err) { next(err); }
};

// ---------- Slides ----------
exports.listSlidesAdmin = async (req, res, next) => {
  try { res.json(await Slide.find().sort('orderIndex')); } catch (err) { next(err); }
};
exports.createSlide = async (req, res, next) => {
  try {
    const slide = await Slide.create(req.body);
    await logAction(req.user._id, `Created slide "${slide.heading}"`, 'Slide', slide._id);
    res.status(201).json(slide);
  } catch (err) { next(err); }
};
exports.updateSlide = async (req, res, next) => {
  try {
    const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found.' });
    await logAction(req.user._id, `Updated slide "${slide.heading}"`, 'Slide', slide._id);
    res.json(slide);
  } catch (err) { next(err); }
};
exports.deleteSlide = async (req, res, next) => {
  try {
    await Slide.findByIdAndDelete(req.params.id);
    await logAction(req.user._id, 'Deleted slide', 'Slide', req.params.id);
    res.json({ message: 'Slide deleted.' });
  } catch (err) { next(err); }
};

// ---------- Homepage Cards (Services / Get In Touch) ----------
exports.listCardsAdmin = async (req, res, next) => {
  try { res.json(await HomepageCard.find().sort('orderIndex')); } catch (err) { next(err); }
};
exports.createCard = async (req, res, next) => {
  try {
    const card = await HomepageCard.create(req.body);
    await logAction(req.user._id, `Created card "${card.title}"`, 'HomepageCard', card._id);
    res.status(201).json(card);
  } catch (err) { next(err); }
};
exports.updateCard = async (req, res, next) => {
  try {
    const card = await HomepageCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).json({ message: 'Card not found.' });
    await logAction(req.user._id, `Updated card "${card.title}"`, 'HomepageCard', card._id);
    res.json(card);
  } catch (err) { next(err); }
};
exports.deleteCard = async (req, res, next) => {
  try {
    await HomepageCard.findByIdAndDelete(req.params.id);
    await logAction(req.user._id, 'Deleted homepage card', 'HomepageCard', req.params.id);
    res.json({ message: 'Card deleted.' });
  } catch (err) { next(err); }
};

// ---------- Bot Templates ----------
exports.listBotTemplates = async (req, res, next) => {
  try { res.json(await BotTemplate.find()); } catch (err) { next(err); }
};
exports.createBotTemplate = async (req, res, next) => {
  try {
    const bot = await BotTemplate.create(req.body);
    await logAction(req.user._id, `Added bot template "${bot.name}"`, 'BotTemplate', bot._id);
    res.status(201).json(bot);
  } catch (err) { next(err); }
};
exports.updateBotTemplate = async (req, res, next) => {
  try {
    const bot = await BotTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bot) return res.status(404).json({ message: 'Bot template not found.' });
    await logAction(req.user._id, `Updated bot template "${bot.name}"`, 'BotTemplate', bot._id);
    res.json(bot);
  } catch (err) { next(err); }
};
exports.deleteBotTemplate = async (req, res, next) => {
  try {
    await BotTemplate.findByIdAndDelete(req.params.id);
    await logAction(req.user._id, 'Deleted bot template', 'BotTemplate', req.params.id);
    res.json({ message: 'Bot template deleted.' });
  } catch (err) { next(err); }
};

// ---------- Deployment Platforms ----------
exports.listPlatformsAdmin = async (req, res, next) => {
  try { res.json(await DeploymentPlatform.find()); } catch (err) { next(err); }
};
exports.createPlatform = async (req, res, next) => {
  try {
    const platform = await DeploymentPlatform.create(req.body);
    await logAction(req.user._id, `Added platform "${platform.name}"`, 'DeploymentPlatform', platform._id);
    res.status(201).json(platform);
  } catch (err) { next(err); }
};
exports.updatePlatform = async (req, res, next) => {
  try {
    const platform = await DeploymentPlatform.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!platform) return res.status(404).json({ message: 'Platform not found.' });
    await logAction(req.user._id, `Updated platform "${platform.name}"`, 'DeploymentPlatform', platform._id);
    res.json(platform);
  } catch (err) { next(err); }
};
exports.checkPlatformHealth = async (req, res, next) => {
  try {
    const platform = await DeploymentPlatform.findById(req.params.id);
    if (!platform) return res.status(404).json({ message: 'Platform not found.' });
    const client = getPlatformClient(platform.slug);
    const health = await client.checkHealth();
    platform.lastHealthStatus = health.status;
    platform.lastHealthMessage = health.message;
    platform.lastCheckedAt = new Date();
    await platform.save();
    res.json(platform);
  } catch (err) { next(err); }
};

// ---------- Users ----------
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash -otpCode').sort('-createdAt');
    res.json(users);
  } catch (err) { next(err); }
};
exports.setUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'USER' | 'DEPLOYER'
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.subscription.plan = plan;
    await user.save();
    await logAction(req.user._id, `Changed ${user.email} to ${plan} plan`, 'User', user._id);
    res.json(user);
  } catch (err) { next(err); }
};
exports.setUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'ACTIVE' | 'BANNED'
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    await logAction(req.user._id, `Set ${user.email} status to ${status}`, 'User', user._id);
    res.json(user);
  } catch (err) { next(err); }
};
exports.adjustUserCoins = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const balance = await adjustCoins(req.params.id, Number(amount), 'ADMIN_ADJUSTMENT', { note });
    await logAction(req.user._id, `Adjusted coins for user ${req.params.id} by ${amount}`, 'User', req.params.id);
    res.json({ balance });
  } catch (err) { next(err); }
};

// ---------- Active Bots Monitor ----------
exports.listAllBots = async (req, res, next) => {
  try {
    const bots = await UserBot.find().populate('userId', 'name email').sort('-createdAt');
    res.json(bots);
  } catch (err) { next(err); }
};
exports.killBot = async (req, res, next) => {
  try {
    const bot = await UserBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ message: 'Bot not found.' });
    if (bot.remoteAppId) {
      const client = getPlatformClient(bot.hostingPlatform);
      await client.destroy(bot.remoteAppId);
    }
    await bot.deleteOne();
    await logAction(req.user._id, `Killed bot ${bot.botName}`, 'UserBot', bot._id);
    res.json({ message: 'Bot terminated.' });
  } catch (err) { next(err); }
};

// ---------- Affiliates ----------
exports.suspendAffiliate = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findOneAndUpdate({ userId: req.params.id }, { linkStatus: 'SUSPENDED' }, { new: true });
    if (!affiliate) return res.status(404).json({ message: 'Affiliate profile not found.' });
    await logAction(req.user._id, `Suspended referral link for user ${req.params.id}`, 'Affiliate', affiliate._id);
    res.json(affiliate);
  } catch (err) { next(err); }
};

// ---------- Audit Log ----------
exports.getActionLog = async (req, res, next) => {
  try {
    const logs = await AdminActionLog.find().populate('adminId', 'name').sort('-createdAt').limit(200);
    res.json(logs);
  } catch (err) { next(err); }
};

