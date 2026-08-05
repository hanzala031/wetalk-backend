const express = require('express');
const router = express.Router();
const { 
  getCurrentLesson, 
  completeStep, 
  getVisibleLessons, 
  getLessonById, 
  completeLesson 
} = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');

// Primary active progression API routes
router.get('/current', protect, getCurrentLesson);
router.post('/complete-step', protect, completeStep);

// Secondary / compatibility routes
router.get('/visible', protect, getVisibleLessons);
router.get('/:id', protect, getLessonById);
router.post('/complete', protect, completeLesson);

module.exports = router;
