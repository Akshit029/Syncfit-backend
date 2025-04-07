// routes/fitness.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FitnessData = require('../models/FitnessData');

// Add a weight entry
router.post('/weight', auth, async (req, res) => {
  try {
    const { weight, date } = req.body;
    
    if (!weight) {
      return res.status(400).json({ message: 'Weight is required' });
    }
    
    // Get today's date in YYYY-MM-DD format if not provided
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    // Find or create fitness data for the user
    let fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    if (!fitnessData) {
      fitnessData = new FitnessData({
        userId: req.user.id,
        weightHistory: [],
        calorieHistory: []
      });
    }
    
    // Add the weight entry
    fitnessData.weightHistory.push({
      date: entryDate,
      weight: parseFloat(weight),
      weightChange: 0 // Will be calculated in pre-save middleware
    });
    
    // Save the fitness data
    await fitnessData.save();
    
    res.json({ message: 'Weight entry added successfully' });
  } catch (error) {
    console.error('Error adding weight entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a calorie entry
router.post('/calories', auth, async (req, res) => {
  try {
    const { calories, date } = req.body;
    
    if (!calories) {
      return res.status(400).json({ message: 'Calories are required' });
    }
    
    // Get today's date in YYYY-MM-DD format if not provided
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    // Find or create fitness data for the user
    let fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    if (!fitnessData) {
      fitnessData = new FitnessData({
        userId: req.user.id,
        weightHistory: [],
        calorieHistory: []
      });
    }
    
    // Add the calorie entry
    fitnessData.calorieHistory.push({
      date: entryDate,
      calories: parseFloat(calories)
    });
    
    // Save the fitness data
    await fitnessData.save();
    
    res.json({ message: 'Calorie entry added successfully' });
  } catch (error) {
    console.error('Error adding calorie entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset fitness data
router.post('/reset', auth, async (req, res) => {
  try {
    // Find and delete the user's fitness data
    await FitnessData.findOneAndDelete({ userId: req.user.id });
    
    res.json({ message: 'Fitness data reset successfully' });
  } catch (error) {
    console.error('Error resetting fitness data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;