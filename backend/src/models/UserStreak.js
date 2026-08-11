const mongoose = require('mongoose');

const weeklyProgressSchema = new mongoose.Schema({
  dayName: {
    type: String,
    required: true
  },
  dateString: {
    type: String,
    required: true
  },
  goalAchieved: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const userStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  dailyXpTarget: {
    type: Number,
    default: 50
  },
  todayXpEarned: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: null
  },
  weeklyProgress: {
    type: [weeklyProgressSchema],
    default: []
  }
}, { timestamps: true, bufferCommands: false });

module.exports = mongoose.model('UserStreak', userStreakSchema);
