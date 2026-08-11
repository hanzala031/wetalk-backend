const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    unique: true
  },
  currentLessonNumber: {
    type: Number,
    required: true,
    default: 1
  },
  completedLessons: {
    type: [Number],
    default: []
  },
  steps: {
    learn: {
      type: Boolean,
      default: false
    },
    practice: {
      type: Boolean,
      default: false
    },
    quiz: {
      type: Boolean,
      default: false
    },
    review: {
      type: Boolean,
      default: false
    }
  },
  lastCompletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true, bufferCommands: false });

module.exports = mongoose.model('UserProgress', userProgressSchema);
