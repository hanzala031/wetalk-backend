const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', protect, streakController.getStreakStatus);
router.post('/add-xp', protect, streakController.addXp);

module.exports = router;
