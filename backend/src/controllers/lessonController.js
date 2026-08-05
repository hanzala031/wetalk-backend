const User = require('../models/User');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');
const UserStreak = require('../models/UserStreak');

// Helper to get remaining time for time-lock
const getRemainingTime = (lastCompletedAt) => {
  const now = new Date();
  const lockDuration = 24 * 60 * 60 * 1000; // 24 hours in ms
  const timeSinceCompletion = now - new Date(lastCompletedAt);
  
  if (timeSinceCompletion >= lockDuration) {
    return { isLocked: false, remainingStr: '' };
  }
  
  const timeRemaining = lockDuration - timeSinceCompletion;
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    isLocked: true,
    remainingStr: `${hours}h ${minutes}m`,
    hours,
    minutes
  };
};

// @desc    Get the current active lesson content for the user (with 24hr lockout)
// @route   GET /api/lessons/current
// @access  Private
const getCurrentLesson = async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.user.id });
    
    // If progress doesn't exist, initialize it
    if (!progress) {
      progress = await UserProgress.create({
        userId: req.user.id,
        currentLessonNumber: 1,
        completedLessons: [],
        steps: { learn: false, practice: false, quiz: false, review: false },
        lastCompletedAt: null
      });
    }

    // Fetch details of the current lesson
    const currentLesson = await Lesson.findOne({ lessonNumber: progress.currentLessonNumber });
    
    if (!currentLesson) {
      return res.json({
        success: true,
        message: 'Congratulations! You have completed all available lessons.',
        progress
      });
    }

    // Check 24-hour lockout timeframe
    if (progress.lastCompletedAt) {
      const lockStatus = getRemainingTime(progress.lastCompletedAt);
      
      if (lockStatus.isLocked) {
        // Return locked status, hide sensitive content (learn, practice, quiz)
        return res.json({
          success: true,
          isLocked: true,
          timeRemaining: lockStatus.remainingStr,
          lessonNumber: currentLesson.lessonNumber,
          title: currentLesson.title,
          description: currentLesson.description,
          steps: progress.steps,
          message: `Next lesson unlocks in ${lockStatus.remainingStr}`
        });
      }
    }

    // Unlocked: Return full lesson details
    res.json({
      success: true,
      isLocked: false,
      lesson: currentLesson,
      steps: progress.steps
    });

  } catch (error) {
    console.error('Get Current Lesson Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete a lesson step (learn -> practice -> quiz -> review)
// @route   POST /api/lessons/complete-step
// @access  Private
const completeStep = async (req, res) => {
  const { lessonNumber, stepName } = req.body;

  if (!lessonNumber || !stepName) {
    return res.status(400).json({ success: false, message: 'Please provide lessonNumber and stepName' });
  }

  const validSteps = ['learn', 'practice', 'quiz', 'review'];
  if (!validSteps.includes(stepName)) {
    return res.status(400).json({ success: false, message: 'Invalid step name. Must be: learn, practice, quiz, review' });
  }

  try {
    let progress = await UserProgress.findOne({ userId: req.user.id });

    if (!progress) {
      progress = await UserProgress.create({
        userId: req.user.id,
        currentLessonNumber: 1,
        completedLessons: [],
        steps: { learn: false, practice: false, quiz: false, review: false },
        lastCompletedAt: null
      });
    }

    // Ensure user is completing the active lesson
    if (Number(lessonNumber) !== progress.currentLessonNumber) {
      return res.status(400).json({ 
        success: false, 
        message: `You can only complete steps for your current active lesson: Lesson ${progress.currentLessonNumber}` 
      });
    }

    // Ensure steps are completed in strict linear order
    if (stepName === 'practice' && !progress.steps.learn) {
      return res.status(400).json({ success: false, message: 'You must complete the Learn step before starting Practice' });
    }
    if (stepName === 'quiz' && !progress.steps.practice) {
      return res.status(400).json({ success: false, message: 'You must complete the Practice step before starting Quiz' });
    }
    if (stepName === 'review' && !progress.steps.quiz) {
      return res.status(400).json({ success: false, message: 'You must complete the Quiz step before starting Review' });
    }

    // Check if next lesson is currently time-locked before starting new steps
    if (progress.lastCompletedAt) {
      const lockStatus = getRemainingTime(progress.lastCompletedAt);
      if (lockStatus.isLocked) {
        return res.status(403).json({
          success: false,
          message: `Action forbidden. The next lesson is locked for ${lockStatus.remainingStr}`
        });
      }
    }

    // Mark the step as completed
    progress.steps[stepName] = true;

    let isLessonFullyCompleted = false;

    // If 'review' step is completed, the entire lesson is completed
    if (stepName === 'review') {
      isLessonFullyCompleted = true;
      
      if (!progress.completedLessons.includes(Number(lessonNumber))) {
        progress.completedLessons.push(Number(lessonNumber));
      }
      
      progress.lastCompletedAt = new Date();
      progress.currentLessonNumber += 1;
      
      // Reset steps tracker for the next lesson
      progress.steps = {
        learn: false,
        practice: false,
        quiz: false,
        review: false
      };

      // Award profile XP and Gems, and sync with UserStreak and progressData
      const user = await User.findById(req.user.id);
      if (user) {
        // 1. Update User Stats
        user.xp = (user.xp || 0) + 100;
        user.coins = (user.coins || 0) + 25;
        
        // 2. Sync with progressData for Frontend / Legacy Compatibility
        if (!user.progressData) user.progressData = {};
        
        // Update completed_lessons list in progressData
        let completedList = [];
        try {
          const raw = user.progressData['completed_lessons'];
          completedList = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
        } catch (e) { completedList = []; }
        
        if (!completedList.includes(Number(lessonNumber))) {
          completedList.push(Number(lessonNumber));
        }
        user.progressData['completed_lessons'] = JSON.stringify(completedList);
        
        // Add completion date for streak tracking
        const todayStr = new Date().toISOString().split('T')[0];
        user.progressData[`completion_date_${lessonNumber}`] = todayStr;
        
        user.lastCompletionDate = new Date();
        user.markModified('progressData');
        await user.save();

        // 3. Update UserStreak model
        let streak = await UserStreak.findOne({ userId: user._id });
        if (!streak) {
          streak = new UserStreak({ userId: user._id });
        }
        
        // Use helper from streakController if possible, but simpler to just update directly here
        // to ensure immediate consistency
        streak.todayXpEarned = (streak.todayXpEarned || 0) + 100;
        
        // If they hit the target (usually 50), update streak
        if (streak.todayXpEarned >= (streak.dailyXpTarget || 50)) {
          const lastActiveStr = streak.lastActiveDate ? streak.lastActiveDate.toISOString().split('T')[0] : null;
          if (lastActiveStr !== todayStr) {
            // New day streak increment
            if (lastActiveStr) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              if (lastActiveStr === yesterdayStr) {
                streak.currentStreak += 1;
              } else {
                streak.currentStreak = 1;
              }
            } else {
              streak.currentStreak = 1;
            }
            streak.lastActiveDate = new Date();
          }
        }
        await streak.save();
      }
    }

    await progress.save();

    res.json({
      success: true,
      message: isLessonFullyCompleted 
        ? `Congratulations! Lesson ${lessonNumber} is fully completed. Next lesson will unlock in 24 hours.`
        : `Step ${stepName} completed successfully.`,
      isLessonFullyCompleted,
      progress
    });

  } catch (error) {
    console.error('Complete Step Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- LEGACY/COMPATIBILITY CONTROLLERS (Using static config or direct DB calls) ---

// @desc    Get visible lessons for the current user
const getVisibleLessons = async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await UserProgress.create({
        userId: req.user.id,
        currentLessonNumber: 1,
        completedLessons: [],
        steps: { learn: false, practice: false, quiz: false, review: false },
        lastCompletedAt: null
      });
    }

    const allLessons = await Lesson.find().sort({ lessonNumber: 1 });
    
    const visibleLessons = allLessons.map((lesson) => {
      let status = 'locked';
      if (progress.completedLessons.includes(lesson.lessonNumber)) {
        status = 'completed';
      } else if (lesson.lessonNumber === progress.currentLessonNumber) {
        status = 'active';
      } else if (lesson.lessonNumber === progress.currentLessonNumber + 1) {
        status = 'next_locked';
      }

      return {
        id: `lesson_${lesson.lessonNumber}`,
        lessonNumber: lesson.lessonNumber,
        title: lesson.title,
        description: lesson.description,
        status
      };
    });

    res.json(visibleLessons);
  } catch (error) {
    console.error('Visible Lessons Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lesson by ID
const getLessonById = async (req, res) => {
  try {
    const idParts = req.params.id.split('_');
    const lessonNum = Number(idParts[1] || req.params.id);

    const lesson = await Lesson.findOne({ lessonNumber: lessonNum });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const progress = await UserProgress.findOne({ userId: req.user.id });
    const isUnlocked = lessonNum <= (progress ? progress.currentLessonNumber : 1);

    if (!isUnlocked) {
      return res.status(403).json({ message: 'This lesson is locked' });
    }

    res.json({
      id: `lesson_${lesson.lessonNumber}`,
      ...lesson.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Legacy complete a lesson
const completeLesson = async (req, res) => {
  const { lessonId } = req.body;
  const idParts = lessonId.split('_');
  const lessonNum = Number(idParts[1] || lessonId);

  try {
    let progress = await UserProgress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await UserProgress.create({
        userId: req.user.id,
        currentLessonNumber: 1,
        completedLessons: [],
        steps: { learn: false, practice: false, quiz: false, review: false },
        lastCompletedAt: null
      });
    }

    if (!progress.completedLessons.includes(lessonNum)) {
      progress.completedLessons.push(lessonNum);
      progress.lastCompletedAt = new Date();
      if (progress.currentLessonNumber === lessonNum) {
        progress.currentLessonNumber += 1;
      }
      await progress.save();
    }

    res.json({
      message: 'Lesson completed successfully',
      progress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCurrentLesson,
  completeStep,
  getVisibleLessons,
  getLessonById,
  completeLesson
};
