const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists by email or username
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: userExists.email === email 
          ? 'Email already in use' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      isGoogleAuth: false
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isGoogleAuth: false
        }
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if user is registered via Google
    if (user.isGoogleAuth) {
      return res.status(401).json({ 
        success: false,
        message: 'Please sign in with Google' 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isGoogleAuth: user.isGoogleAuth
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Could not extract email from Google account' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        username: email.split('@')[0],
        email,
        googleId,
        isGoogleAuth: true,
        profilePicture: picture
      });
    } else if (!user.googleId) {
      // If user exists but doesn't have googleId, update it
      user.googleId = googleId;
      user.isGoogleAuth = true;
      user.profilePicture = picture || user.profilePicture;
      await user.save();
    }

    const authToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isGoogleAuth: true
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      error: error.message 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isGoogleAuth: user.isGoogleAuth
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
