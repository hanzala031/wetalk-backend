const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Get User Notifications
 * Route: GET /api/user/notifications
 * Access: Private
 */
exports.getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    // Seed initial notifications if none exist
    if (notifications.length === 0) {
      const initialNotifications = [
        {
          user: req.user.id,
          title: 'Welcome to AI Learning!',
          description: 'Start your first lesson today and begin your English journey.',
          category: 'Updates',
          createdAt: new Date(),
        },
        {
          user: req.user.id,
          title: 'Daily Streak Reminder',
          description: 'Don\'t forget to practice today to keep your streak alive!',
          category: 'Reminders',
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
        {
          user: req.user.id,
          title: 'New Lesson Available',
          description: 'A new lesson on "Business English" has been added for you.',
          category: 'Lessons',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
        }
      ];
      await Notification.insertMany(initialNotifications);
      notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      notifications: notifications.map(notif => ({
        id: notif._id,
        title: notif.title,
        description: notif.description,
        category: notif.category,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        time: formatTime(notif.createdAt), 
      })),
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error getting notifications',
      error: error.message,
    });
  }
};

/**
 * Clear All Notifications
 * Route: DELETE /api/user/notifications
 * Access: Private
 */
exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });

    return res.status(200).json({
      success: true,
      message: 'Notifications cleared successfully',
    });
  } catch (error) {
    console.error('Clear Notifications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error clearing notifications',
      error: error.message,
    });
  }
};

/**
 * Mark Notification as Read
 * Route: PUT /api/user/notifications/:id
 * Access: Private
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking notification as read',
      error: error.message
    });
  }
};

// Helper to format time for frontend
const formatTime = (date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

/**
 * Update User Profile
 * Route: PUT /api/user/profile
 * Access: Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (profileImage) user.profileImage = profileImage;
    if (req.body.learningGoal) user.learningGoal = req.body.learningGoal;
    if (req.body.targetLanguage) user.targetLanguage = req.body.targetLanguage;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        learningGoal: user.learningGoal,
        targetLanguage: user.targetLanguage,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message,
    });
  }
};

/**
 * Upload Image - Store as base64 data URL in database
 * Route: POST /api/user/upload-image
 * Access: Public (or Private with token)
 */
exports.uploadImage = async (req, res) => {
  try {
    const { base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided',
      });
    }

    // Validate base64 format
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid base64 image data format',
      });
    }

    // Check size - limit to ~2MB of base64 data
    const base64Length = matches[2].length;
    const sizeInBytes = (base64Length * 3) / 4;
    if (sizeInBytes > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image too large. Please use an image under 2MB.',
      });
    }

    // Return the base64 data URL directly - no local file storage needed
    console.log('Image accepted as base64 data URL');
    
    return res.status(200).json({
      success: true,
      secure_url: base64Data, // Return the base64 data URL directly
    });
  } catch (error) {
    console.error('Server Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error uploading image',
      error: error.message,
    });
  }
};

/**
 * Get User Progress
 * Route: GET /api/user/sync
 * Access: Private
 */
exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      progressData: user.progressData || {},
    });
  } catch (error) {
    console.error('Get Progress Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error getting progress',
      error: error.message,
    });
  }
};

/**
 * Save User Progress
 * Route: POST /api/user/sync
 * Access: Private
 */
exports.saveProgress = async (req, res) => {
  try {
    const { progressData } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    user.progressData = progressData;
    user.markModified('progressData');
    await user.save();
    return res.status(200).json({
      success: true,
      message: 'Progress synced successfully',
    });
  } catch (error) {
    console.error('Save Progress Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving progress',
      error: error.message,
    });
  }
};

/**
 * Get User Profile
 * Route: GET /api/user/profile
 * Access: Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        learningGoal: user.learningGoal,
        targetLanguage: user.targetLanguage,
        xp: user.xp,
        coins: user.coins,
        streak: user.streak,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error getting profile',
      error: error.message,
    });
  }
};

/**
 * Get User Settings
 * Route: GET /api/user/settings
 */
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      settings: {
        learningGoal: user.learningGoal || 'Casual',
        targetLanguage: user.targetLanguage || 'English',
        notificationPrefs: user.notificationPrefs || {},
        privacySettings: user.privacySettings || {},
      },
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error getting settings',
      error: error.message,
    });
  }
};

/**
 * Update User Settings
 * Route: PUT /api/user/settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { learningGoal, targetLanguage, notificationPrefs, privacySettings } = req.body;

    if (learningGoal) user.learningGoal = learningGoal;
    if (targetLanguage) user.targetLanguage = targetLanguage;
    if (notificationPrefs) {
      user.notificationPrefs = {
        ...(user.notificationPrefs?.toObject?.() || user.notificationPrefs || {}),
        ...notificationPrefs,
      };
    }
    if (privacySettings) {
      user.privacySettings = {
        ...(user.privacySettings?.toObject?.() || user.privacySettings || {}),
        ...privacySettings,
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        learningGoal: user.learningGoal,
        targetLanguage: user.targetLanguage,
        notificationPrefs: user.notificationPrefs,
        privacySettings: user.privacySettings,
      },
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating settings',
      error: error.message,
    });
  }
};

/**
 * Delete User Account
 * Route: DELETE /api/user/account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting account',
      error: error.message,
    });
  }
};

