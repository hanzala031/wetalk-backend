const mongoose = require('mongoose');

const wtCoinTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardType: {
    type: String,
    required: true
    // "Signup Bonus", "Lesson Completed", "Module Completed", "7-Day Streak"
  },
  coinsEarned: {
    type: Number,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { bufferCommands: false });

module.exports = mongoose.model('WtCoinTransaction', wtCoinTransactionSchema);
