const express = require('express');
const router = express.Router();
const config = require('../controllers/configController');

router.get('/', config.getConfig);
router.get('/slides', config.getSlides);
router.get('/cards', config.getCards);

module.exports = router;
