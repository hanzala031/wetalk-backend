const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'wetalk_super_secret_key_2024', {
    expiresIn: '30d',
  });
};

/**
 * Register User
 * Route: POST /api/auth/signup
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    if (user) {
      const token = generateToken(user._id);
      
      // Return details exactly as frontend expects
      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server registration error',
      error: error.message,
    });
  }
};

/**
 * Login User
 * Route: POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    console.log('Login attempt for email:', email.toLowerCase());
    // Find user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.log('Login failure: User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('User found, checking password...');
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Login failure: Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('Login successful for user:', email);
    const token = generateToken(user._id);

    // Return details exactly as frontend expects
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server login error',
      error: error.message,
    });
  }
};

/**
 * Google Sign In / Sign Up
 * Route: POST /api/auth/google
 */
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required',
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google sign-in is not configured on the server',
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const name = payload.name || payload.given_name || 'Google User';
    const picture = payload.picture || 'default-avatar.png';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is not available',
      });
    }

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        profileImage: picture,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture && (!user.profileImage || user.profileImage === 'default-avatar.png')) {
          user.profileImage = picture;
        }
        if (!user.name && name) {
          user.name = name;
        }
        await user.save();
      }
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      isNewUser,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
    });
  }
};
