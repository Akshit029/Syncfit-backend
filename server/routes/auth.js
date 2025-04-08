const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const router = express.Router();


//signup


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    console.log('------------- REGISTRATION ATTEMPT -------------');
    console.log('Registration attempt with email:', email);
    console.log('Registration password length:', password.length);
    
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    // Validate email format
    if (!validator.isEmail(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Password strength check
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ message: 'Email is already registered' });
    }
    
    console.log('Creating new user with email:', email);
    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save hook
    });
    
    await newUser.save();
    console.log('User saved successfully with ID:', newUser._id);
    
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour in milliseconds
      sameSite: 'Lax',
    });
    
    return res.json({
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error('Registration error details:', err.message);
    console.error('Full registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});



//login


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('------------- LOGIN ATTEMPT -------------');
    console.log('Login attempt email:', email);
    console.log('Login attempt password length:', password.length);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide both email and password' });
    }
    
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found in database for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found in database:', {
      id: user._id.toString(),
      email: user.email,
      passwordHash: user.password.substring(0, 10) + '...',
      passwordLength: user.password.length
    });
    
    // Compare passwords
    console.log('About to compare passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password matched successfully!');
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Send token as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour in milliseconds
      sameSite: 'Lax',
    });
    
    // Return user data (without password) to the frontend
    return res.json({
      message: 'User logged in successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error details:', err.message);
    console.error('Full error object:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});





// Get current user information



// In your authRoutes.js file, update the /user endpoint to include step data:

// Get current user information
router.get('/user', async (req, res) => {
  try {
    // Get token from the cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user and verify they exist
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      // Clear invalid token
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
      });
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert stepHistory Map to a plain object for JSON serialization
    const userData = user.toObject();
    if (userData.stepHistory instanceof Map) {
      userData.stepHistory = Object.fromEntries(userData.stepHistory);
    }
    
    return res.json({ 
      message: 'Authentication successful',
      user: userData
    });
  } catch (err) {
    // Clear invalid token on any error
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    console.error('Auth check error:', err);
    return res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

// Force logout all users (clear all cookies)
router.post('/force-logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/'
  });
  return res.json({ message: 'All sessions cleared' });
});





// Add user update route
router.put('/update', async (req, res) => {
  try {
    // Get token from the cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, email } = req.body;
    
    // Validate inputs
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if email is already taken (by another user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    
    await user.save();
    
    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});





// update in profile
router.put('/update', async (req, res) => {
  try {
    // Get token from the cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, email } = req.body;
    
    // Validate inputs
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if email is already taken (by another user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    
    await user.save();
    
    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});





// Change password route
router.put('/change-password', async (req, res) => {
  try {
    // Get token from the cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    // Note: The password will be hashed via the pre-save hook you likely have in your User model
    user.password = newPassword;
    
    await user.save();
    
    return res.json({ 
      success: true, 
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;