const express = require('express');
const {
  registerUser,
    loginUser,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// 1. User signup
router.post('/register', registerUser);
router.post('/login',         loginUser); 
// 2. Request reset link
router.post('/forgot-password', forgotPassword);

// 3. Reset password by token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
