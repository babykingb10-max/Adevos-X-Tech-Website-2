const express = require('express');
const router = express.Router();
const coins = require('../controllers/coinsController');
const { authenticateUser } = require('../middleware/auth');

router.get('/leaderboard', coins.getLeaderboard);
router.get('/wallet', authenticateUser, coins.getWallet);
router.post('/referral/generate', authenticateUser, coins.generateReferralLink);
router.get('/referral/history', authenticateUser, coins.getReferralHistory);

module.exports = router;
