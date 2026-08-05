const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    const userId = decoded.id || (decoded.user && decoded.user.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found, authorization denied' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

module.exports = {
  protect,
  authMiddleware: protect // fallback
};
