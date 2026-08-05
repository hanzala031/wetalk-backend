const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
    required: function () {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  profileImage: {
    type: String,
    default: 'default-avatar.png'
  },
  xp: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastCompletionDate: {
    type: Date,
    default: null
  },
  progressData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  learningGoal: {
    type: String,
    enum: ['Casual', 'Regular', 'Intensive'],
    default: 'Casual',
  },
  targetLanguage: {
    type: String,
    default: 'English',
  },
  notificationPrefs: {
    lessonReminders: { type: Boolean, default: true },
    streakAlerts: { type: Boolean, default: true },
    achievementAlerts: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
  },
  privacySettings: {
    showProfile: { type: Boolean, default: true },
    shareProgress: { type: Boolean, default: true },
    analyticsEnabled: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }
  console.log('Hashing password for user:', this.email);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
