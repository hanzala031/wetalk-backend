const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route path: /api/user/profile
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/wt-coins/details', protect, userController.getCoinDetails);
router.get('/wt-coins-details', protect, userController.getCoinDetails);
router.get('/wt-coins', protect, userController.getCoinDetails);
router.post('/upload-image', userController.uploadImage);
router.get('/sync', protect, userController.getProgress);
router.post('/sync', protect, userController.saveProgress);
router.get('/settings', protect, userController.getSettings);
router.put('/settings', protect, userController.updateSettings);
router.get('/notifications', protect, userController.getNotifications);
router.put('/notifications/:id', protect, userController.markNotificationRead);
router.delete('/notifications', protect, userController.clearNotifications);
router.delete('/account', protect, userController.deleteAccount);
router.get('/grammar-corrections', protect, userController.getGrammarCorrections);

module.exports = router;
