const express = require('express');
const router = express.Router();
const bots = require('../controllers/botsController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/deployment-status', bots.getDeploymentStatus);
router.get('/available', bots.getAvailableBots);
router.get('/platforms', bots.getPlatforms);
router.post('/deploy', bots.deployBot);
router.get('/mine', bots.getMyBots);
router.post('/:id/change-platform', bots.changePlatform);
router.post('/:id/:action', bots.botAction); // restart | stop | logs
router.delete('/:id', bots.deleteBot);

module.exports = router;
