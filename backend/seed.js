const bcrypt = require('bcryptjs');
const User = require('./models/User');
const SiteConfig = require('./models/SiteConfig');
const Slide = require('./models/Slide');
const HomepageCard = require('./models/HomepageCard');
const BotTemplate = require('./models/BotTemplate');
const DeploymentPlatform = require('./models/DeploymentPlatform');
const Tutorial = require('./models/Tutorial');
const Update = require('./models/Update');

async function runSeed() {
  await dropLegacyIndexes();
  await seedSiteConfig();
  await seedSlides();
  await seedCards();
  await seedBotTemplates();
  await seedPlatforms();
  await seedTutorials();
  await seedUpdates();
  await seedAdmin();
}

// Cleans up indexes from earlier schema versions that no longer match the
// current model (e.g. the removed unique referralCode index on User, which
// caused E11000 duplicate key errors once more than one user had no code).
async function dropLegacyIndexes() {
  try {
    const indexes = await User.collection.indexes();
    const legacy = indexes.find(idx => idx.name === 'referralCode_1');
    if (legacy) {
      await User.collection.dropIndex('referralCode_1');
      console.log('[seed] Dropped legacy referralCode_1 index on users collection.');
    }
  } catch (err) {
    console.log('[seed] Legacy index cleanup skipped:', err.message);
  }
}

async function seedSiteConfig() {
  const exists = await SiteConfig.findOne({ key: 'GLOBAL' });
  if (exists) return;
  await SiteConfig.create({
    key: 'GLOBAL',
    brandName: 'Adevos-X Tech',
    supportLinks: {
      whatsapp: 'https://chat.whatsapp.com/replace-with-real-link',
      telegramGroup: 'https://t.me/replace-with-real-group',
      channel: 'https://t.me/replace-with-real-channel'
    },
    freeBotFeature: { enabled: true, minBotUrl: 'https://adevos-min-bot.site' },
    paymentSettings: {
      manualEnabled: true, paystackEnabled: true, coinsEnabled: true,
      manualInstructions: process.env.MANUAL_PAYMENT_INSTRUCTIONS || 'Pay via M-Pesa: 07XXXXXXXX (Adevos-X Tech)',
      pricing: { 'Wiki 2': 10000, 'Wiki 4': 19000, 'Wiki 6': 27000, 'Wiki 8': 34000 }
    }
  });
  console.log('[seed] SiteConfig created.');
}

async function seedSlides() {
  const count = await Slide.countDocuments();
  if (count > 0) return;
  await Slide.insertMany([
    { heading: 'Deploy Using AV Coins', subtext: 'Use your coins to deploy a bot without paying cash.', btnText: 'Learn More', target: '/pages/av-coins.html', orderIndex: 1 },
    { heading: 'Watch Step-by-Step Tutorials', subtext: 'Learn how to deploy and manage your bot in minutes.', btnText: 'Explore Tutorials', target: '/pages/tutorials.html', orderIndex: 2 },
    { heading: 'Deploy Unlimited Bots With a Deployer Account', subtext: 'Upgrade for multi-bot hosting on any platform.', btnText: 'Create Now', action: 'DEPLOYER_UPGRADE', orderIndex: 3 },
    { heading: '24/7 Community Support', subtext: 'Get help anytime from our WhatsApp and Telegram community.', btnText: 'Join Now', target: '/index.html#support-card', orderIndex: 4 }
  ]);
  console.log('[seed] Slides created.');
}

async function seedCards() {
  const count = await HomepageCard.countDocuments();
  if (count > 0) return;
  await HomepageCard.insertMany([
    { section: 'services', title: 'WhatsApp Bots', description: 'Automated high-speed WhatsApp bots for business.', iconClass: 'fa-brands fa-whatsapp', orderIndex: 1 },
    { section: 'services', title: 'Web Development', description: 'Custom modern Progressive Web Apps and portals.', iconClass: 'fa-solid fa-code', orderIndex: 2 },
    { section: 'services', title: 'AI Solutions', description: 'AI integrations that power next-generation products.', iconClass: 'fa-solid fa-brain', orderIndex: 3 },
    { section: 'services', title: 'Telegram Bots', description: 'High-speed Telegram integrations and utilities.', iconClass: 'fa-brands fa-telegram', orderIndex: 4 },
    { section: 'services', title: 'Cyber Security', description: 'Enterprise-grade security consulting and audits.', iconClass: 'fa-solid fa-shield-halved', orderIndex: 5 },
    { section: 'services', title: 'Bot Deployment', description: 'Fast, reliable hosting for your bots, 24/7.', iconClass: 'fa-solid fa-rocket', orderIndex: 6 },

    { section: 'get_in_touch', title: 'Deploy Bot', description: 'Launch your bot in under two minutes.', iconClass: 'fa-solid fa-cloud-arrow-up', btnText: 'Deploy Now', action: 'DEPLOY_BOT', orderIndex: 1 },
    { section: 'get_in_touch', title: 'Deployer Account', description: 'Unlock unlimited bot hosting.', iconClass: 'fa-solid fa-user-plus', btnText: 'Create Account', action: 'CREATE_DEPLOYER', orderIndex: 2 },
    { section: 'get_in_touch', title: 'Manage Your Bot', description: 'Check status, logs, and controls.', iconClass: 'fa-solid fa-gear', btnText: 'Manage Now', action: 'MANAGE_BOT', orderIndex: 3 },
    { section: 'get_in_touch', title: 'Watch Tutorials', description: 'Step-by-step setup guidance.', iconClass: 'fa-solid fa-circle-play', btnText: 'Watch Now', action: 'OPEN_TUTORIALS_DROPDOWN', orderIndex: 4 },
    { section: 'get_in_touch', title: 'Send Your Feedback', description: 'Your input shapes what we build next.', iconClass: 'fa-solid fa-paper-plane', btnText: 'Send Now', action: 'OPEN_FEEDBACK_FORM', orderIndex: 5 },
    { section: 'get_in_touch', title: 'Get Support', description: 'Reach our WhatsApp and Telegram community.', iconClass: 'fa-solid fa-headset', btnText: 'Join Now', action: 'OPEN_SUPPORT_DROPDOWN', orderIndex: 6 },
    { section: 'get_in_touch', title: 'Updates', description: 'Read the latest announcements.', iconClass: 'fa-solid fa-bullhorn', btnText: 'View Updates', target: '/pages/updates.html', orderIndex: 7 },
    { section: 'get_in_touch', title: 'Meet a Developer', description: 'Talk directly with the team.', iconClass: 'fa-solid fa-user-tie', btnText: 'Contact', action: 'CONTACT_DEVELOPER', orderIndex: 8 }
  ]);
  console.log('[seed] Homepage cards created.');
}

async function seedBotTemplates() {
  const count = await BotTemplate.countDocuments();
  if (count > 0) return;
  await BotTemplate.insertMany([
    {
      name: 'Adevos MD Bot v1', description: 'A reliable multi-device WhatsApp bot with the essentials built in.',
      imageUrl: 'https://via.placeholder.com/400x240/0f1712/00ff66?text=Adevos+MD+Bot',
      sourceCodeUrl: 'https://github.com/adevos-x/adevos-md-bot',
      pairingSites: [{ label: 'Primary Pairing Site', url: 'https://pair.adevosxtech.site' }],
      allocation: 'BOTH', isActive: true
    },
    {
      name: 'Adevos Group Guard', description: 'Group management and moderation bot for WhatsApp communities.',
      imageUrl: 'https://via.placeholder.com/400x240/0f1712/00ff66?text=Group+Guard',
      sourceCodeUrl: 'https://github.com/adevos-x/adevos-group-guard',
      pairingSites: [{ label: 'Primary Pairing Site', url: 'https://pair.adevosxtech.site' }],
      allocation: 'DEPLOYER', isActive: true
    }
  ]);
  console.log('[seed] Bot templates created.');
}

async function seedPlatforms() {
  const count = await DeploymentPlatform.countDocuments();
  if (count > 0) return;
  await DeploymentPlatform.insertMany([
    { name: 'Koyeb', slug: 'koyeb', recommended: true, isEnabled: true, lastHealthStatus: 'OPERATIONAL', lastHealthMessage: 'Fast builds, recommended for most bots.' },
    { name: 'Render', slug: 'render', isEnabled: true, lastHealthStatus: 'OPERATIONAL', lastHealthMessage: 'Reliable background workers.' }
  ]);
  console.log('[seed] Deployment platforms created.');
}

async function seedTutorials() {
  const count = await Tutorial.countDocuments();
  if (count > 0) return;
  await Tutorial.insertMany([
    {
      title: 'How to Get a Session ID and Deploy Your Bot', category: 'Deployment', videoType: 'YOUTUBE',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: '3:45',
      writtenSteps: ['Open the pairing site.', 'Enter your WhatsApp number with the country code.', 'Copy the Session ID and paste it into the deployment form.'],
      isPublished: true
    }
  ]);
  console.log('[seed] Tutorials created.');
}

async function seedUpdates() {
  const count = await Update.countDocuments();
  if (count > 0) return;
  await Update.create({
    title: 'Adevos-X Tech Is Live',
    summary: 'Welcome to the new Adevos-X Tech platform.',
    fullContent: 'Thanks for joining Adevos-X Tech. Deploy your first bot from the Bot Deployment menu, or explore the tutorials to get familiar with the platform.',
    category: 'NEW_FEATURE', isPublished: true, allowPopup: true, popupTarget: 'ALL'
  });
  console.log('[seed] Welcome update created.');
}

async function seedAdmin() {
  const existing = await User.findOne({ role: 'ADMIN' });
  if (existing) return;
  const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'change_this_immediately';
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: username, email: `${username}@adevosxtech.site`, passwordHash,
    emailVerified: true, role: 'ADMIN', status: 'ACTIVE'
  });
  console.log(`[seed] Default admin created — username: ${username}. Change the password immediately.`);
}

module.exports = { runSeed };
