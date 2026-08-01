const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const feedback = require('../controllers/feedbackController');
const updates = require('../controllers/updatesController');
const tutorials = require('../controllers/tutorialsController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Public: admin login (separate from user Google/Apple/email login)
router.post('/login', admin.login);

// Everything below requires a valid admin session
router.use(authenticateUser, requireAdmin);

router.get('/dashboard', admin.getDashboard);
router.get('/logs', admin.getActionLog);

// Site config
router.put('/config', admin.updateSiteConfig);

// Slides
router.get('/slides', admin.listSlidesAdmin);
router.post('/slides', admin.createSlide);
router.put('/slides/:id', admin.updateSlide);
router.delete('/slides/:id', admin.deleteSlide);

// Homepage cards
router.get('/cards', admin.listCardsAdmin);
router.post('/cards', admin.createCard);
router.put('/cards/:id', admin.updateCard);
router.delete('/cards/:id', admin.deleteCard);

// Bot templates
router.get('/bot-templates', admin.listBotTemplates);
router.post('/bot-templates', admin.createBotTemplate);
router.put('/bot-templates/:id', admin.updateBotTemplate);
router.delete('/bot-templates/:id', admin.deleteBotTemplate);

// Deployment platforms
router.get('/platforms', admin.listPlatformsAdmin);
router.post('/platforms', admin.createPlatform);
router.put('/platforms/:id', admin.updatePlatform);
router.post('/platforms/:id/check-health', admin.checkPlatformHealth);

// Users
router.get('/users', admin.listUsers);
router.put('/users/:id/plan', admin.setUserPlan);
router.put('/users/:id/status', admin.setUserStatus);
router.post('/users/:id/coins', admin.adjustUserCoins);
router.post('/users/:id/suspend-affiliate', admin.suspendAffiliate);

// Active bots monitor
router.get('/bots', admin.listAllBots);
router.delete('/bots/:id', admin.killBot);

// Feedback & Tickets
router.get('/feedback', feedback.listFeedback);
router.post('/feedback/:id/reply', feedback.replyFeedback);

// Updates manager
router.post('/updates', updates.createUpdate);
router.put('/updates/:id', updates.updateUpdate);
router.delete('/updates/:id', updates.deleteUpdate);
router.post('/updates/:id/trigger-popup', updates.triggerPopup);

// Tutorials manager
router.post('/tutorials', tutorials.createTutorial);
router.put('/tutorials/:id', tutorials.updateTutorial);
router.delete('/tutorials/:id', tutorials.deleteTutorial);

module.exports = router;
