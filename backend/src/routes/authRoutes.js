const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Support both /signup (used by frontend) and /register
router.post('/signup', authController.register);
router.post('/register', authController.register);

// Support login
router.post('/login', authController.login);

// Google OAuth
router.post('/google', authController.googleAuth);

// Password Reset Request
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
