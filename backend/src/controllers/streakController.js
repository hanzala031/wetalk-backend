const UserStreak = require('../models/UserStreak');
const User = require('../models/User');

// Helper to format date as YYYY-MM-DD
const formatDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dateVal = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dateVal}`;
};

// Helper to calculate difference in calendar days
const getCalendarDayDifference = (date1, date2) => {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// Helper to get Monday of the current week
const getStartOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  // In JS: Sun = 0, Mon = 1, Tue = 2, Wed = 3, Thu = 4, Fri = 5, Sat = 6
  // We want Monday to be the start of the week.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Helper to generate calendar week starting on Monday
const generateWeeklyProgress = (startDate) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const progress = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    progress.push({
      dayName: days[i],
      dateString: formatDateString(d),
      goalAchieved: false
    });
  }
  return progress;
};

// Main helper to synchronize and check midnight/weekly resets
const syncStreakState = (streakDoc) => {
  // Force target to 50 XP
  streakDoc.dailyXpTarget = 50;

  const today = new Date();
  const todayStr = formatDateString(today);
  
  // 1. Sync Weekly Progress - reset if it's a new week
  const monday = getStartOfWeek(today);
  const mondayStr = formatDateString(monday);
  
  if (!streakDoc.weeklyProgress || streakDoc.weeklyProgress.length < 7 || streakDoc.weeklyProgress[0].dateString !== mondayStr) {
    streakDoc.weeklyProgress = generateWeeklyProgress(monday);
  }
  
  // 2. Reset daily XP earned if it's a new day (compare against last update time)
  const lastUpdateStr = streakDoc.updatedAt 
    ? formatDateString(streakDoc.updatedAt) 
    : null;
    
  if (lastUpdateStr && lastUpdateStr !== todayStr) {
    // It's a new day since last update — reset today's XP
    streakDoc.todayXpEarned = 0;
    
    // Check if streak should be broken (missed more than 1 day since last active)
    if (streakDoc.lastActiveDate) {
      const diffFromLastActive = getCalendarDayDifference(today, streakDoc.lastActiveDate);
      if (diffFromLastActive > 1) {
        // Missed a day — reset streak
        streakDoc.currentStreak = 0;
      }
    }
  }
  
  // 3. Ensure weeklyProgress is in sync — if lastActiveDate is today, mark it achieved
  if (streakDoc.lastActiveDate && formatDateString(streakDoc.lastActiveDate) === todayStr) {
    const dayItem = streakDoc.weeklyProgress.find(d => d.dateString === todayStr);
    if (dayItem) {
      dayItem.goalAchieved = true;
    }
  }
  
  return streakDoc;
};

// Reconstruct streak and weekly ticks from user completion dates
const rebuildStreakFromProgress = (streakDoc, progressData) => {
  if (!progressData) return;

  // 1. Force target to 50 XP
  streakDoc.dailyXpTarget = 50;

  // 2. Gather all completion dates from progressData
  const completionDates = new Set();
  for (const [key, value] of Object.entries(progressData)) {
    if (key.startsWith('completion_date_') && value) {
      completionDates.add(value.trim());
    }
  }

  // 3. Mark weekly progress goal achieved for dates in the set
  if (streakDoc.weeklyProgress && streakDoc.weeklyProgress.length === 7) {
    for (const day of streakDoc.weeklyProgress) {
      if (completionDates.has(day.dateString)) {
        day.goalAchieved = true;
      }
    }
  }

  // 4. Reconstruct currentStreak count
  const sortedDates = Array.from(completionDates).sort((a, b) => new Date(b) - new Date(a));
  
  if (sortedDates.length === 0) {
    streakDoc.currentStreak = 0;
    streakDoc.lastActiveDate = null;
    return;
  }

  const today = new Date();
  const todayStr = formatDateString(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateString(yesterday);

  const latestDateStr = sortedDates[0];
  if (latestDateStr === todayStr || latestDateStr === yesterdayStr) {
    let currentStreak = 1;
    let dateIndex = 1;
    let prevDate = new Date(latestDateStr);
    
    while (dateIndex < sortedDates.length) {
      const nextDate = new Date(sortedDates[dateIndex]);
      const diff = getCalendarDayDifference(prevDate, nextDate);
      
      if (diff === 1) {
        currentStreak++;
        prevDate = nextDate;
        dateIndex++;
      } else if (diff === 0) {
        // Same day duplicate, skip
        dateIndex++;
      } else {
        break;
      }
    }
    streakDoc.currentStreak = currentStreak;
    streakDoc.lastActiveDate = new Date(latestDateStr);
  } else {
    // Gap of more than 1 day before today, streak reset to 0
    streakDoc.currentStreak = 0;
    streakDoc.lastActiveDate = new Date(latestDateStr);
  }
};

// GET /api/streak/status
const getStreakStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    let streak = await UserStreak.findOne({ userId });
    
    if (!streak) {
      streak = new UserStreak({ userId });
    }
    
    syncStreakState(streak);

    // Auto-repair and rebuild streak from progressData
    const user = await User.findById(userId);
    if (user && user.progressData) {
      rebuildStreakFromProgress(streak, user.progressData);
    }
    
    await streak.save();
    
    res.status(200).json({
      success: true,
      data: {
        currentStreak: streak.currentStreak,
        dailyXpTarget: streak.dailyXpTarget,
        todayXpEarned: streak.todayXpEarned,
        lastActiveDate: streak.lastActiveDate,
        weeklyProgress: streak.weeklyProgress
      }
    });
  } catch (error) {
    console.error('Error fetching streak status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak status',
      error: error.message
    });
  }
};

// POST /api/streak/add-xp
const addXp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xpAmount } = req.body;
    
    if (xpAmount === undefined || typeof xpAmount !== 'number' || xpAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid non-negative xpAmount is required'
      });
    }
    
    let streak = await UserStreak.findOne({ userId });
    if (!streak) {
      streak = new UserStreak({ userId });
    }
    
    // Sync state (resets daily XP if new day, resets streak if missed days)
    syncStreakState(streak);
    
    const today = new Date();
    const todayStr = formatDateString(today);

    // Add XP for today
    streak.todayXpEarned += xpAmount;
    
    let goalHitToday = false;
    
    // Check if daily XP target is met and we haven't already counted today
    if (streak.todayXpEarned >= streak.dailyXpTarget) {
      if (!streak.lastActiveDate || formatDateString(streak.lastActiveDate) !== todayStr) {
        // First time hitting the goal today — increment streak
        streak.currentStreak += 1;
        streak.lastActiveDate = today;
        
        // Mark today as achieved in weeklyProgress
        const dayItem = streak.weeklyProgress.find(d => d.dateString === todayStr);
        if (dayItem) {
          dayItem.goalAchieved = true;
        }
        goalHitToday = true;
      }
    }

    // After updating today's streak info, rebuild from historical completion dates
    // but preserve today's already-computed state
    const user = await User.findById(userId);
    if (user && user.progressData) {
      // Save today's computed values before rebuild
      const savedStreak = streak.currentStreak;
      const savedLastActive = streak.lastActiveDate;
      const savedTodayXp = streak.todayXpEarned;
      const savedWeeklyProgress = JSON.parse(JSON.stringify(streak.weeklyProgress));

      rebuildStreakFromProgress(streak, user.progressData);

      // rebuildStreakFromProgress checks history; if today goal was already hit,
      // its result should agree. But if the rebuild produces a higher streak (e.g.,
      // from prior completion dates), keep whichever is higher.
      if (savedStreak > streak.currentStreak) {
        streak.currentStreak = savedStreak;
        streak.lastActiveDate = savedLastActive;
      }
      
      // Restore today's XP (rebuild doesn't know about current session XP)
      streak.todayXpEarned = savedTodayXp;
      
      // Merge weekly progress: if we marked today as achieved, keep it
      if (goalHitToday) {
        const dayItem = streak.weeklyProgress.find(d => d.dateString === todayStr);
        if (dayItem) {
          dayItem.goalAchieved = true;
        }
        streak.lastActiveDate = savedLastActive;
      }
    }
    
    await streak.save();
    
    res.status(200).json({
      success: true,
      data: {
        currentStreak: streak.currentStreak,
        dailyXpTarget: streak.dailyXpTarget,
        todayXpEarned: streak.todayXpEarned,
        lastActiveDate: streak.lastActiveDate,
        weeklyProgress: streak.weeklyProgress
      },
      goalHitToday
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add XP',
      error: error.message
    });
  }
};

module.exports = {
  getStreakStatus,
  addXp,
  // Helper functions exported for testing
  formatDateString,
  getCalendarDayDifference,
  getStartOfWeek,
  generateWeeklyProgress,
  syncStreakState
};
