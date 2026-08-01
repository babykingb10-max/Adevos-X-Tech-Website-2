/* =========================================================
   ADEVOS-X TECH — CONFIG
   Default bootstrapped data. The backend seeds identical data
   into MongoDB on first boot (see backend/seed.js) — this copy
   is only a client-side fallback while the API loads, so the
   site is never blank on first paint.
   ========================================================= */

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/v1'
  : 'https://adevos-x-tech-website-e3dd767aec0e.herokuapp.com/api/v1';

const AppConfig = {
  siteSettings: {
    siteName: 'Adevos-X Tech',
    supportLinks: {
      whatsapp: 'https://chat.whatsapp.com/replace-with-real-link',
      telegramGroup: 'https://t.me/replace-with-real-group',
      channel: 'https://t.me/replace-with-real-channel'
    },
    freeBotFeatureEnabled: true,
    freeBotUrl: 'https://adevos-min-bot.site',
    bgMusicEnabled: true
  },

  sidebar: [
    {
      id: 'home', title: 'Home', icon: 'fa-house', target: '/',
      subItems: [{ title: 'Dashboard', target: '/' }]
    },
    {
      id: 'updates', title: 'Updates', icon: 'fa-bell', target: '/pages/updates.html',
      subItems: [{ title: 'Latest News', target: '/pages/updates.html' }]
    },
    {
      id: 'deployment', title: 'Bot Deployment', icon: 'fa-cloud-arrow-up',
      subItems: [
        { title: 'Deploy Bot', target: '/pages/available-bots.html' },
        { title: 'Manage Your Bot', target: '/pages/manage.html' },
        { title: 'My AV Coins', target: '/pages/av-coins.html' }
      ]
    },
    {
      id: 'account', title: 'My Account', icon: 'fa-user',
      subItems: [{ title: 'Account Settings', target: '/pages/account.html' }]
    },
    {
      id: 'tutorials', title: 'Tutorials', icon: 'fa-graduation-cap', target: '/pages/tutorials.html',
      subItems: [{ title: 'Explore Tutorials', target: '/pages/tutorials.html' }]
    },
    {
      id: 'feedback', title: 'Feedback', icon: 'fa-comment-dots', target: '/#feedback-card',
      subItems: [{ title: 'Send Your Feedback', target: '/#feedback-card' }]
    },
    {
      id: 'support', title: 'Support', icon: 'fa-headset',
      subItems: [
        { title: 'WhatsApp Group', external: true, target: 'whatsapp' },
        { title: 'Telegram Group', external: true, target: 'telegramGroup' },
        { title: 'Official Channel', external: true, target: 'channel' }
      ]
    },
    {
      id: 'developer', title: 'Developer', icon: 'fa-code', target: '/#developer-card',
      subItems: [{ title: 'Meet a Developer', target: '/#developer-card' }]
    }
  ],

  heroSlides: [
    {
      id: 'slide-1', heading: 'Deploy Using AV Coins', subtext: 'Use your coins to deploy a bot without paying cash.',
      btnText: 'Learn More', target: '/pages/av-coins.html'
    },
    {
      id: 'slide-2', heading: 'Watch Step-by-Step Tutorials', subtext: 'Learn how to deploy and manage your bot in minutes.',
      btnText: 'Explore Tutorials', target: '/pages/tutorials.html'
    },
    {
      id: 'slide-3', heading: 'Deploy Unlimited Bots With a Deployer Account', subtext: 'Upgrade for multi-bot hosting on any platform.',
      btnText: 'Create Now', action: 'DEPLOYER_UPGRADE'
    },
    {
      id: 'slide-4', heading: '24/7 Community Support', subtext: 'Get help anytime from our WhatsApp and Telegram community.',
      btnText: 'Join Now', target: '/#support-card'
    }
  ],

  services: [
    { icon: 'fa-brands fa-whatsapp', title: 'WhatsApp Bots', description: 'Automated high-speed WhatsApp bots for business.' },
    { icon: 'fa-solid fa-code', title: 'Web Development', description: 'Custom modern Progressive Web Apps and portals.' },
    { icon: 'fa-solid fa-brain', title: 'AI Solutions', description: 'AI integrations that power next-generation products.' },
    { icon: 'fa-brands fa-telegram', title: 'Telegram Bots', description: 'High-speed Telegram integrations and utilities.' },
    { icon: 'fa-solid fa-shield-halved', title: 'Cyber Security', description: 'Enterprise-grade security consulting and audits.' },
    { icon: 'fa-solid fa-rocket', title: 'Bot Deployment', description: 'Fast, reliable hosting for your bots, 24/7.' }
  ],

  getInTouch: [
    { icon: 'fa-solid fa-cloud-arrow-up', title: 'Deploy Bot', description: 'Launch your bot in under two minutes.', btnText: 'Deploy Now', action: 'DEPLOY_BOT' },
    { icon: 'fa-solid fa-user-plus', title: 'Deployer Account', description: 'Unlock unlimited bot hosting.', btnText: 'Create Account', action: 'CREATE_DEPLOYER' },
    { icon: 'fa-solid fa-gear', title: 'Manage Your Bot', description: 'Check status, logs, and controls.', btnText: 'Manage Now', action: 'MANAGE_BOT' },
    { icon: 'fa-solid fa-circle-play', title: 'Watch Tutorials', description: 'Step-by-step setup guidance.', btnText: 'Watch Now', action: 'OPEN_TUTORIALS_DROPDOWN' },
    { icon: 'fa-solid fa-paper-plane', title: 'Send Your Feedback', description: 'Your input shapes what we build next.', btnText: 'Send Now', action: 'OPEN_FEEDBACK_FORM' },
    { icon: 'fa-solid fa-headset', title: 'Get Support', description: 'Reach our WhatsApp and Telegram community.', btnText: 'Join Now', action: 'OPEN_SUPPORT_DROPDOWN' },
    { icon: 'fa-solid fa-bullhorn', title: 'Updates', description: 'Read the latest announcements.', btnText: 'View Updates', target: '/pages/updates.html' },
    { icon: 'fa-solid fa-user-tie', title: 'Meet a Developer', description: 'Talk directly with the team.', btnText: 'Contact', action: 'CONTACT_DEVELOPER' }
  ]
};
