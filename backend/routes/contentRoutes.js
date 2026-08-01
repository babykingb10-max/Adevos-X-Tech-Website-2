const express = require('express');
const router = express.Router();
const feedback = require('../controllers/feedbackController');
const updates = require('../controllers/updatesController');
const tutorials = require('../controllers/tutorialsController');
const { authenticateUser } = require('../middleware/auth');

// Feedback
router.post('/feedback', feedback.sendFeedback);

// Updates
router.get('/updates', updates.listUpdates);
router.post('/updates/:id/read', authenticateUser, updates.markRead);
router.post('/updates/read-all', authenticateUser, updates.markAllRead);

// Tutorials
router.get('/tutorials', tutorials.listTutorials);

module.exports = router;
