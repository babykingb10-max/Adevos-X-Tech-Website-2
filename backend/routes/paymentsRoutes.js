const express = require('express');
const router = express.Router();
const payments = require('../controllers/paymentsController');
const { authenticateUser } = require('../middleware/auth');

router.get('/methods', payments.getMethods);
router.post('/webhook', payments.webhookConfirm); // called by Mobile Money/Paystack providers
router.post('/initiate', authenticateUser, payments.initiatePayment);
router.get('/:id/status', authenticateUser, payments.getPaymentStatus);

module.exports = router;
