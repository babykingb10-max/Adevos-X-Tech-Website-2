const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

router.post('/signup', auth.signup);
router.post('/verify-otp', auth.verifyOtp);
router.post('/resend-otp', auth.resendOtp);
router.post('/login', auth.login);
router.post('/google', auth.googleLogin);
router.get('/me', authenticateUser, auth.me);

module.exports = router;
