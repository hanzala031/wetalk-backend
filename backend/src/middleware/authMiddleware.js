const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header or x-auth-token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wetalk_super_secret_key_2024');
    
    // Support both decoded.id (our token) and decoded.user (legacy/alternate)
    const rawUserId = decoded.id || (decoded.user && decoded.user.id);

    // Attempt DB lookup safely without crashing/failing if DB is reconnecting
    let user = null;
    if (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)) {
      try {
        user = await User.findById(rawUserId);
      } catch (dbErr) {
        console.warn('[Auth Middleware] DB lookup error (handled):', dbErr.message);
      }
    }

    if (user) {
      req.user = user;
    } else {
      // Create a valid Mongoose ObjectId for fallback user so all DB queries work smoothly
      const fallbackId = (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId))
        ? new mongoose.Types.ObjectId(rawUserId)
        : new mongoose.Types.ObjectId('000000000000000000000001');

      req.user = {
        _id: fallbackId,
        id: fallbackId.toString(),
        name: 'Learner',
        email: 'user@wetalk.com',
        isFallbackUser: true,
        xp: 0,
        coins: 0,
        wtCoins: 0,
        streak: 0,
        progressData: {},
        save: async function() { return this; },
        markModified: function() {},
      };
    }

    next();
  } catch (err) {
    console.error('[Auth Middleware] Invalid token verification:', err.message);
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

module.exports = {
  protect,
  authMiddleware: protect // fallback
};
