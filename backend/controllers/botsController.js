const User = require('../models/User');
const UserBot = require('../models/UserBot');
const BotTemplate = require('../models/BotTemplate');
const DeploymentPlatform = require('../models/DeploymentPlatform');
const { getPlatformClient } = require('../utils/platformClients');
const { slugifyAppName } = require('../utils/slug');

// GET /bots/deployment-status
exports.getDeploymentStatus = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.subscription || user.subscription.status !== 'ACTIVE') {
      return res.json({ state: 'PAYMENT_REQUIRED', message: 'Choose a plan and pay to unlock deployment.' });
    }

    const bots = await UserBot.find({ userId: user._id });

    if (user.subscription.plan === 'USER') {
      if (bots.length > 0) {
        return res.json({ state: 'ALREADY_DEPLOYED', plan: 'USER', bot: bots[0], actionsAllowed: ['RESTART', 'STOP', 'CHANGE_NUMBER', 'VIEW_LOGS'] });
      }
      return res.json({ state: 'READY_TO_DEPLOY', plan: 'USER', maxAllowed: 1 });
    }

    // DEPLOYER
    return res.json({ state: 'DEPLOYER_DASHBOARD', plan: 'DEPLOYER', deployedBots: bots, canDeployMore: true });
  } catch (err) { next(err); }
};

// GET /bots/available
exports.getAvailableBots = async (req, res, next) => {
  try {
    const plan = req.user.subscription?.plan || 'USER';
    const filter = plan === 'DEPLOYER' ? { isActive: true } : { isActive: true, allocation: { $in: ['USER', 'BOTH'] } };
    const bots = plan === 'DEPLOYER' ? await BotTemplate.find(filter) : await BotTemplate.find(filter).limit(1);
    res.json(bots);
  } catch (err) { next(err); }
};

// GET /bots/platforms
exports.getPlatforms = async (req, res, next) => {
  try {
    const platforms = await DeploymentPlatform.find({ isEnabled: true });
    res.json(platforms.map(p => ({
      name: p.name,
      recommended: p.recommended,
      available: ['OPERATIONAL'].includes(p.lastHealthStatus),
      statusMessage: p.lastHealthMessage || 'Status unknown — will be checked before deployment.'
    })));
  } catch (err) { next(err); }
};

// POST /bots/deploy
exports.deployBot = async (req, res, next) => {
  try {
    const { botId, platform, sessionId, botName, prefix } = req.body;
    if (!platform || !sessionId) return res.status(400).json({ message: 'Platform and Session ID are required.' });

    const user = req.user;
    if (!user.subscription || user.subscription.status !== 'ACTIVE') {
      return res.status(402).json({ message: 'Your subscription is not active. Please pay first.' });
    }

    const existingCount = await UserBot.countDocuments({ userId: user._id });
    if (user.subscription.plan === 'USER' && existingCount >= 1) {
      return res.status(409).json({ message: 'User plan allows only one bot. Delete it first or upgrade to Deployer.' });
    }

    const platformDoc = await DeploymentPlatform.findOne({ slug: platform.toLowerCase(), isEnabled: true });
    if (!platformDoc) return res.status(400).json({ message: 'Selected platform is not available.' });

    const template = botId ? await BotTemplate.findById(botId) : null;
    const client = getPlatformClient(platformDoc.slug);
    const appName = slugifyAppName(user.name, botName || template?.name);
    const { remoteAppId } = await client.deploy({ appName, sessionId, botName, prefix, githubRepo: template?.sourceCodeUrl });

    const bot = await UserBot.create({
      userId: user._id,
      botTemplateId: template?._id || null,
      botName: botName || template?.name || 'My Bot',
      sessionId,
      hostingPlatform: platformDoc.slug,
      remoteAppId,
      githubRepo: template?.sourceCodeUrl || null,
      prefix: prefix || '.',
      status: 'BUILDING'
    });

    res.status(201).json({ message: 'Deployment started.', bot });
  } catch (err) { next(err); }
};

// GET /bots/mine
exports.getMyBots = async (req, res, next) => {
  try {
    const bots = await UserBot.find({ userId: req.user._id }).sort('-createdAt');
    res.json(bots);
  } catch (err) { next(err); }
};

async function findOwnedBot(userId, botId) {
  const bot = await UserBot.findOne({ _id: botId, userId });
  if (!bot) throw { status: 404, message: 'Bot not found.' };
  return bot;
}

// POST /bots/:id/restart | /stop | /logs
exports.botAction = async (req, res, next) => {
  try {
    const { id, action } = req.params;
    const bot = await findOwnedBot(req.user._id, id);

    if (action === 'logs') {
      // TODO: stream real logs from the platform (SSE/Socket.io). Placeholder response below.
      return res.json({ logs: `[${new Date().toISOString()}] Bot "${bot.botName}" is ${bot.status}.\nNo further log lines available yet.` });
    }

    if (action === 'restart') { bot.status = 'ACTIVE'; bot.lastActive = new Date(); await bot.save(); return res.json({ message: 'Restart requested.', bot }); }
    if (action === 'stop') { bot.status = 'STOPPED'; await bot.save(); return res.json({ message: 'Bot stopped.', bot }); }

    res.status(400).json({ message: 'Unknown action.' });
  } catch (err) { next(err); }
};

// DELETE /bots/:id
exports.deleteBot = async (req, res, next) => {
  try {
    const bot = await findOwnedBot(req.user._id, req.params.id);
    const client = getPlatformClient(bot.hostingPlatform);
    if (bot.remoteAppId) await client.destroy(bot.remoteAppId);
    await bot.deleteOne();
    res.json({ message: 'Deployment deleted.' });
  } catch (err) { next(err); }
};

// POST /bots/:id/change-platform
exports.changePlatform = async (req, res, next) => {
  try {
    const bot = await findOwnedBot(req.user._id, req.params.id);
    const { platform } = req.body;
    const newPlatformDoc = await DeploymentPlatform.findOne({ slug: platform.toLowerCase(), isEnabled: true });
    if (!newPlatformDoc) return res.status(400).json({ message: 'Selected platform is not available.' });

    const oldClient = getPlatformClient(bot.hostingPlatform);
    if (bot.remoteAppId) await oldClient.destroy(bot.remoteAppId);

    const newClient = getPlatformClient(newPlatformDoc.slug);
    const appName = slugifyAppName(req.user.name, bot.botName);
    const { remoteAppId } = await newClient.deploy({ appName, sessionId: bot.sessionId, botName: bot.botName, prefix: bot.prefix, githubRepo: bot.githubRepo });

    bot.hostingPlatform = newPlatformDoc.slug;
    bot.remoteAppId = remoteAppId;
    bot.status = 'BUILDING';
    await bot.save();

    res.json({ message: 'Migrated to new platform.', bot });
  } catch (err) { next(err); }
};
