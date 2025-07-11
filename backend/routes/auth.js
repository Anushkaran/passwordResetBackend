// backend/routes/auth.js
const express = require('express');
const {
  register,
  forgotPassword,
  verifyToken,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// === Registration endpoint ===
router.post('/register', register);

// === Existing reset flow ===
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', verifyToken);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
