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

module.exports = router;
