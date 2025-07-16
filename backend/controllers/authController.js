const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const nodemailer = require('nodemailer');

// POST /api/auth/register
exports.registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) 
      return res.status(400).json({ message: 'Email & password required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    await new User({ email, password: hash }).save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) 
      return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken  = token;
    user.tokenExpiry = Date.now() + 3600000; // 1h
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${link}">here</a> to reset your password. Link expires in 1 hour.</p>`
    });

    res.json({ message: 'Reset email sent' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      tokenExpiry: { $gt: Date.now() }
    });
    if (!user) 
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password   = await bcrypt.hash(password, 10);
    user.resetToken  = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // success
    res.json({ message: 'Login successful' });
  } catch (err) {
    next(err);
  }
};
