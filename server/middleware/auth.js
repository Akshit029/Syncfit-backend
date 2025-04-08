const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and verify they exist
    const user = await User.findById(decoded.userId);
    if (!user) {
      // Clear invalid token
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
      });
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user in request
    req.user = { 
      id: user._id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (err) {
    // Clear invalid token on any error
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    console.error('Authentication error:', err);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

module.exports = auth; 