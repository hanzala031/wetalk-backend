const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/pronunciation', protect, practiceController.evaluatePronunciation);
router.get('/vocabulary', protect, practiceController.getVocabularyFlashcards);
router.post('/vocabulary/master', protect, practiceController.masterVocabularyWord);
router.post('/vocabulary/save', protect, practiceController.saveVocabularyWord);

module.exports = router;
