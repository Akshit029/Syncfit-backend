const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// Get all feedback (public route)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Submit new feedback (protected route - requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;
    
    // Validate required fields
    if (!name || !rating || !message) {
      return res.status(400).json({ message: 'Name, rating, and message are required' });
    }
    
    // Create new feedback
    const feedback = new Feedback({
      name,
      email,
      rating,
      message
    });
    
    // Save feedback
    await feedback.save();
    
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

module.exports = router; 