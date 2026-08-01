const SiteConfig = require('../models/SiteConfig');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { adjustCoins } = require('../utils/coins');

const PLAN_WEEKS = { 'Wiki 2': 2, 'Wiki 4': 4, 'Wiki 6': 6, 'Wiki 8': 8 };

// GET /payments/methods
exports.getMethods = async (req, res, next) => {
  try {
    const config = await SiteConfig.findOne({ key: 'GLOBAL' });
    res.json({
      manualEnabled: config.paymentSettings.manualEnabled,
      paystackEnabled: config.paymentSettings.paystackEnabled,
      coinsEnabled: config.paymentSettings.coinsEnabled,
      manualInstructions: config.paymentSettings.manualInstructions,
      freeBotEnabled: config.freeBotFeature.enabled,
      freeBotUrl: config.freeBotFeature.minBotUrl,
      pricing: config.paymentSettings.pricing
    });
  } catch (err) { next(err); }
};

// POST /payments/initiate
exports.initiatePayment = async (req, res, next) => {
  try {
    const { context, plan, amount, method, transactionRef } = req.body;
    if (!['BOT_DEPLOYMENT', 'DEPLOYER_UPGRADE'].includes(context)) return res.status(400).json({ message: 'Invalid payment context.' });
    if (!PLAN_WEEKS[plan]) return res.status(400).json({ message: 'Invalid subscription plan.' });

    if (method === 'COINS') {
      if (context === 'DEPLOYER_UPGRADE') return res.status(400).json({ message: 'Coins cannot be used for the Deployer upgrade.' });
      const config = await SiteConfig.findOne({ key: 'GLOBAL' });
      const required = Math.ceil(amount / config.coinSettings.coinToTzsRate);
      await adjustCoins(req.user._id, -required, 'DEPLOYMENT_PAYMENT', { note: `Paid for ${plan}` });
      const payment = await Payment.create({ userId: req.user._id, context, plan, amount, method, status: 'ACTIVE', paidAt: new Date() });
      await activateSubscription(req.user, plan, context);
      return res.status(201).json({ paymentId: payment._id, status: 'ACTIVE' });
    }

    if (method === 'MANUAL') {
      const payment = await Payment.create({ userId: req.user._id, context, plan, amount, method, transactionRef, status: 'PENDING' });
      // Real flow: an admin reviews the transactionRef and marks the payment ACTIVE from the Admin App,
      // or a Mobile Money webhook (M-Pesa/Tigo/AzamPay) calls exports.webhookConfirm below automatically.
      return res.status(201).json({ paymentId: payment._id, status: 'PENDING' });
    }

    if (method === 'PAYSTACK') {
      // TODO: create a Paystack transaction and return an authorization_url for the frontend to redirect to.
      const payment = await Payment.create({ userId: req.user._id, context, plan, amount, method, status: 'PENDING' });
      return res.status(201).json({ paymentId: payment._id, status: 'PENDING', message: 'Configure PAYSTACK_SECRET_KEY to enable card checkout.' });
    }

    res.status(400).json({ message: 'Unsupported payment method.' });
  } catch (err) { next(err); }
};

// GET /payments/:id/status
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    res.json({ status: payment.status });
  } catch (err) { next(err); }
};

// POST /payments/webhook — called by Mobile Money / Paystack providers, or by the Admin App on manual approval
exports.webhookConfirm = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId).populate('userId');
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });

    payment.status = 'ACTIVE';
    payment.paidAt = new Date();
    await payment.save();

    await activateSubscription(payment.userId, payment.plan, payment.context);
    res.json({ message: 'Payment confirmed.' });
  } catch (err) { next(err); }
};

async function activateSubscription(user, plan, context) {
  const weeks = PLAN_WEEKS[plan];
  const expiresAt = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);
  const resolvedPlan = context === 'DEPLOYER_UPGRADE' ? 'DEPLOYER' : (user.subscription?.plan || 'USER');
  user.subscription = { status: 'ACTIVE', plan: resolvedPlan, expiresAt };
  await user.save();
}

exports.activateSubscription = activateSubscription;
