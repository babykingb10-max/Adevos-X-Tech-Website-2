const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendMail, otpEmail } = require('../utils/mailer');

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
}

function publicUser(user) {
  return {
    id: user._id, name: user.name, email: user.email, profilePic: user.profilePic,
    subscription: user.subscription, coinsBalance: user.coinsBalance, role: user.role
  };
}

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

// POST /auth/signup — creates an unverified account and emails an OTP
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.emailVerified) return res.status(409).json({ message: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = existing
      ? Object.assign(existing, { name, passwordHash, otpCode, otpExpiresAt })
      : new User({ name, email: email.toLowerCase(), passwordHash, otpCode, otpExpiresAt });
    await user.save();

    await sendMail({ to: user.email, subject: 'Your Adevos-X Tech verification code', html: otpEmail(otpCode) });
    res.json({ message: 'Verification code sent.' });
  } catch (err) { next(err); }
};

// POST /auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !user.otpCode) return res.status(400).json({ message: 'No pending verification for this email.' });
    if (user.otpCode !== code) return res.status(400).json({ message: 'That code is not valid.' });
    if (user.otpExpiresAt < new Date()) return res.status(400).json({ message: 'That code has expired. Request a new one.' });

    user.emailVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
};

// POST /auth/resend-otp
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found for this email.' });

    user.otpCode = generateOtp();
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendMail({ to: user.email, subject: 'Your new Adevos-X Tech verification code', html: otpEmail(user.otpCode) });
    res.json({ message: 'Code resent.' });
  } catch (err) { next(err); }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Incorrect email or password.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Incorrect email or password.' });
    if (!user.emailVerified) return res.status(403).json({ message: 'Please verify your email first.' });

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
};

// POST /auth/google — accepts a Google ID token verified on the client/SDK
exports.googleLogin = async (req, res, next) => {
  try {
    // In production: verify req.body.idToken with google-auth-library here
    // and extract { sub, email, name, picture } from the verified payload.
    return res.status(501).json({ message: 'Configure GOOGLE_CLIENT_ID and google-auth-library verification to enable this.' });
  } catch (err) { next(err); }
};

// GET /auth/me
exports.me = async (req, res) => {
  res.json(publicUser(req.user));
};
