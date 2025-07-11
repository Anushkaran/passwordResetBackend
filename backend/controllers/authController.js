// backend/controllers/authController.js
const crypto    = require('crypto');
const bcrypt    = require('bcryptjs');
const User      = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { CLIENT_URL } = process.env;

/** 
 * Registration handler 
 */
async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await new User({ email, password: hashed }).save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    next(err);
  }
}

/** 
 * Forgot-password handler 
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(404).json({ message: 'Email not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken   = token;
    user.resetExpires = Date.now() + 3600 * 1000;
    await user.save();

    const resetURL = `${CLIENT_URL}/reset-password/${token}`;

    // Log for development
    console.log('🔑 Password reset URL:', resetURL);

    const html = `
      <p>You requested a password reset.</p>
      <p><a href="${resetURL}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour.</p>
    `;
    await sendEmail(email, 'Password Reset', html);

    // Return the URL for easy dev testing
    res.json({
      message: 'Password reset link sent',
      resetURL
    });
  } catch (err) {
    next(err);
  }
}

/** 
 * Verify-token handler 
 */
async function verifyToken(req, res, next) {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() }
    });
    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });
    res.json({ message: 'Token valid' });
  } catch (err) {
    next(err);
  }
}

/** 
 * Reset-password handler 
 */
async function resetPassword(req, res, next) {
  try {
    const { token }    = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() }
    });
    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password     = await bcrypt.hash(password, 10);
    user.resetToken   = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  forgotPassword,
  verifyToken,
  resetPassword
};
