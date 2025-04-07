const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const FitnessData = require('../models/FitnessData');
const mongoose = require('mongoose');

// Get all fitness data
router.get('/', auth, async (req, res) => {
  try {
    // Get user's fitness data
    const fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    // Get user data for workouts
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Calculate total workouts completed using totalWorkouts field
    const workoutsCompleted = user.workouts.reduce((total, workout) => total + (workout.totalWorkouts || 0), 0);

    // Calculate total calories burned
    const caloriesBurned = user.workouts.reduce((total, workout) => total + workout.totalCalories, 0);

    // Get weight data
    const weightData = fitnessData ? fitnessData.weightHistory.map(entry => ({
      timeLabel: entry.date,
      weight: entry.weight
    })) : [];

    // Get all weight entries for the full history graph
    const allWeightEntries = fitnessData ? fitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight
    })) : [];

    // Calculate total weight lost
    const weightLost = allWeightEntries.length >= 2 
      ? allWeightEntries[0].weight - allWeightEntries[allWeightEntries.length - 1].weight 
      : 0;

    // Get milestones from user data
    const milestones = user.milestones || [];

    res.json({
      workoutsCompleted,
      caloriesBurned,
      weightLost,
      weightData,
      allWeightEntries,
      milestones,
      workoutHistory: user.workoutHistory || []
    });
  } catch (err) {
    console.error('Error fetching fitness data:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get workout plan
router.get('/workout-plan', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Return the user's workouts
    res.json(user.workouts || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get today's workout
router.get('/today-workout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's workout or return empty workout
    const todayWorkout = user.workouts.find(w => w.date === today) || {
      exercises: [],
      totalCalories: 0,
      totalDuration: 0
    };
    
    res.json(todayWorkout);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add exercise to today's workout
router.post('/add-exercise', auth, async (req, res) => {
  try {
    const { name, focus, duration, calories } = req.body;
    
    // Validate input
    if (!name || !focus || !duration || !calories) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Create new exercise
    const newExercise = {
      name,
      focus,
      duration: parseFloat(duration),
      calories: parseFloat(calories)
    };
    
    // Find today's workout or create new one
    let todayWorkout = user.workouts.find(w => w.date === today);
    if (!todayWorkout) {
      todayWorkout = {
        date: today,
        exercises: [],
        totalCalories: 0,
        totalDuration: 0
      };
      user.workouts.push(todayWorkout);
    }
    
    // Add exercise and update totals
    todayWorkout.exercises.push(newExercise);
    todayWorkout.totalCalories += newExercise.calories;
    todayWorkout.totalDuration += newExercise.duration;
    
    await user.save();
    res.json(todayWorkout);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Remove exercise from today's workout
router.post('/remove-exercise', auth, async (req, res) => {
  try {
    const { index } = req.body;
    
    // Validate input
    if (index === undefined) {
      return res.status(400).json({ msg: 'Please provide the exercise index' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's workout
    const todayWorkout = user.workouts.find(w => w.date === today);
    if (!todayWorkout) {
      return res.status(404).json({ msg: 'No workout found for today' });
    }
    
    // Validate index
    if (index < 0 || index >= todayWorkout.exercises.length) {
      return res.status(400).json({ msg: 'Invalid exercise index' });
    }
    
    // Remove exercise and update totals
    const removedExercise = todayWorkout.exercises[index];
    todayWorkout.exercises.splice(index, 1);
    todayWorkout.totalCalories -= removedExercise.calories;
    todayWorkout.totalDuration -= removedExercise.duration;
    
    await user.save();
    res.json(todayWorkout);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Complete today's workout
router.post('/complete-workout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's workout
    const todayWorkout = user.workouts.find(w => w.date === today);
    if (!todayWorkout) {
      return res.status(404).json({ msg: 'No workout found for today' });
    }
    
    // Mark workout as completed
    todayWorkout.completed = true;
    
    // Add to workout history
    if (!user.workoutHistory) {
      user.workoutHistory = [];
    }
    
    user.workoutHistory.push({
      date: today,
      exercises: todayWorkout.exercises,
      totalCalories: todayWorkout.totalCalories,
      totalDuration: todayWorkout.totalDuration
    });
    
    // Update the workout in the workouts array
    const workoutIndex = user.workouts.findIndex(w => w.date === today);
    if (workoutIndex !== -1) {
      user.workouts[workoutIndex] = todayWorkout;
    }
    
    await user.save();
    res.json({ 
      history: user.workoutHistory,
      workouts: user.workouts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get workout history
router.get('/workout-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Return workout history or empty array
    res.json(user.workoutHistory || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

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
    
    // Get updated fitness data to return
    const updatedFitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    // Get user data for workouts
    const user = await User.findById(req.user.id);
    
    // Calculate total workouts completed using totalWorkouts field
    const workoutsCompleted = user.workouts.reduce((total, workout) => total + (workout.totalWorkouts || 0), 0);

    // Calculate total calories burned
    const caloriesBurned = user.workouts.reduce((total, workout) => total + workout.totalCalories, 0);

    // Get weight data
    const weightData = updatedFitnessData.weightHistory.map(entry => ({
      timeLabel: entry.date,
      weight: entry.weight
    }));

    // Get all weight entries for the full history graph
    const allWeightEntries = updatedFitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight
    }));

    // Calculate total weight lost
    const weightLost = allWeightEntries.length >= 2 
      ? allWeightEntries[0].weight - allWeightEntries[allWeightEntries.length - 1].weight 
      : 0;

    res.json({
      workoutsCompleted,
      caloriesBurned,
      weightLost,
      weightData,
      allWeightEntries,
      milestones: []
    });
  } catch (error) {
    console.error('Error adding weight entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a milestone
router.post('/milestone', auth, async (req, res) => {
  try {
    const { milestoneName } = req.body;
    
    if (!milestoneName) {
      return res.status(400).json({ message: 'Milestone name is required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Add the milestone with a unique ID
    const newMilestone = {
      _id: new mongoose.Types.ObjectId(),
      name: milestoneName,
      date: new Date(),
      completed: false
    };
    
    user.milestones.push(newMilestone);
    await user.save();
    
    // Get updated fitness data to return
    const fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    // Calculate total workouts completed using totalWorkouts field
    const workoutsCompleted = user.workouts.reduce((total, workout) => total + (workout.totalWorkouts || 0), 0);

    // Calculate total calories burned
    const caloriesBurned = user.workouts.reduce((total, workout) => total + workout.totalCalories, 0);

    // Get weight data
    const weightData = fitnessData ? fitnessData.weightHistory.map(entry => ({
      timeLabel: entry.date,
      weight: entry.weight
    })) : [];

    // Get all weight entries for the full history graph
    const allWeightEntries = fitnessData ? fitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight
    })) : [];

    // Calculate total weight lost
    const weightLost = allWeightEntries.length >= 2 
      ? allWeightEntries[0].weight - allWeightEntries[allWeightEntries.length - 1].weight 
      : 0;

    res.json({
      workoutsCompleted,
      caloriesBurned,
      weightLost,
      weightData,
      allWeightEntries,
      milestones: user.milestones
    });
  } catch (error) {
    console.error('Error adding milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a milestone
router.delete('/milestone/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Remove the milestone using the ID
    user.milestones = user.milestones.filter(m => m._id.toString() !== req.params.id);
    await user.save();
    
    // Get updated fitness data to return
    const fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    // Calculate total workouts completed using totalWorkouts field
    const workoutsCompleted = user.workouts.reduce((total, workout) => total + (workout.totalWorkouts || 0), 0);

    // Calculate total calories burned
    const caloriesBurned = user.workouts.reduce((total, workout) => total + workout.totalCalories, 0);

    // Get weight data
    const weightData = fitnessData ? fitnessData.weightHistory.map(entry => ({
      timeLabel: entry.date,
      weight: entry.weight
    })) : [];

    // Get all weight entries for the full history graph
    const allWeightEntries = fitnessData ? fitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight
    })) : [];

    // Calculate total weight lost
    const weightLost = allWeightEntries.length >= 2 
      ? allWeightEntries[0].weight - allWeightEntries[allWeightEntries.length - 1].weight 
      : 0;

    res.json({
      workoutsCompleted,
      caloriesBurned,
      weightLost,
      weightData,
      allWeightEntries,
      milestones: user.milestones
    });
  } catch (error) {
    console.error('Error removing milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update activity (workouts and calories)
router.post('/activity', auth, async (req, res) => {
  try {
    const { workouts, calories } = req.body;
    
    if (!workouts && !calories) {
      return res.status(400).json({ message: 'At least one of workouts or calories is required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's workout or create new one
    let todayWorkout = user.workouts.find(w => w.date === today);
    if (!todayWorkout) {
      todayWorkout = {
        date: today,
        exercises: [],
        totalCalories: 0,
        totalDuration: 0,
        totalWorkouts: 0,
        completed: false
      };
      user.workouts.push(todayWorkout);
    }
    
    // Update workout counts and calories
    if (workouts) {
      todayWorkout.totalWorkouts = (todayWorkout.totalWorkouts || 0) + parseInt(workouts);
      todayWorkout.completed = true;
    }
    if (calories) {
      todayWorkout.totalCalories = (todayWorkout.totalCalories || 0) + parseInt(calories);
    }
    
    await user.save();
    
    // Get updated fitness data to return
    const fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    // Calculate total workouts completed using totalWorkouts field
    const workoutsCompleted = user.workouts.reduce((total, workout) => total + (workout.totalWorkouts || 0), 0);

    // Calculate total calories burned
    const caloriesBurned = user.workouts.reduce((total, workout) => total + workout.totalCalories, 0);

    // Get weight data
    const weightData = fitnessData ? fitnessData.weightHistory.map(entry => ({
      timeLabel: entry.date,
      weight: entry.weight
    })) : [];

    // Get all weight entries for the full history graph
    const allWeightEntries = fitnessData ? fitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight
    })) : [];

    // Calculate total weight lost
    const weightLost = allWeightEntries.length >= 2 
      ? allWeightEntries[0].weight - allWeightEntries[allWeightEntries.length - 1].weight 
      : 0;

    res.json({
      workoutsCompleted,
      caloriesBurned,
      weightLost,
      weightData,
      allWeightEntries,
      milestones: user.milestones || []
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a workout by date
router.delete('/workout/:date', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Remove the workout for the specified date
    user.workouts = user.workouts.filter(w => w.date !== req.params.date);
    await user.save();
    
    // Get updated fitness data to return
    const fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    // Calculate total workouts completed using totalWorkouts field
    const workoutsCompleted = user.workouts.reduce((total, workout) => total + (workout.totalWorkouts || 0), 0);

    // Calculate total calories burned
    const caloriesBurned = user.workouts.reduce((total, workout) => total + workout.totalCalories, 0);

    // Get weight data
    const weightData = fitnessData ? fitnessData.weightHistory.map(entry => ({
      timeLabel: entry.date,
      weight: entry.weight
    })) : [];

    // Get all weight entries for the full history graph
    const allWeightEntries = fitnessData ? fitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight
    })) : [];

    // Calculate total weight lost
    const weightLost = allWeightEntries.length >= 2 
      ? allWeightEntries[0].weight - allWeightEntries[allWeightEntries.length - 1].weight 
      : 0;

    res.json({
      workoutsCompleted,
      caloriesBurned,
      weightLost,
      weightData,
      allWeightEntries,
      milestones: user.milestones || []
    });
  } catch (error) {
    console.error('Error removing workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a weight entry by date
router.delete('/weight/:date', auth, async (req, res) => {
  try {
    const fitnessData = await FitnessData.findOne({ userId: req.user.id });
    if (!fitnessData) {
      return res.status(404).json({ msg: 'Fitness data not found' });
    }
    
    // Remove the weight entry for the specified date
    fitnessData.weightHistory = fitnessData.weightHistory.filter(entry => entry.date !== req.params.date);
    await fitnessData.save();
    
    // Get user data for workouts
    const user = await User.findById(req.user.id);
    
    // Calculate total workouts completed using totalWorkouts field
    const workoutsCompleted = user.workouts.reduce((total, workout) => total + (workout.totalWorkouts || 0), 0);

    // Calculate total calories burned
    const caloriesBurned = user.workouts.reduce((total, workout) => total + workout.totalCalories, 0);

    // Get weight data
    const weightData = fitnessData.weightHistory.map(entry => ({
      timeLabel: entry.date,
      weight: entry.weight
    }));

    // Get all weight entries for the full history graph
    const allWeightEntries = fitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight
    }));

    // Calculate total weight lost
    const weightLost = allWeightEntries.length >= 2 
      ? allWeightEntries[0].weight - allWeightEntries[allWeightEntries.length - 1].weight 
      : 0;

    res.json({
      workoutsCompleted,
      caloriesBurned,
      weightLost,
      weightData,
      allWeightEntries,
      milestones: user.milestones || []
    });
  } catch (error) {
    console.error('Error removing weight entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove exercise from workout history
router.post('/remove-history-exercise', auth, async (req, res) => {
  try {
    const { date, exerciseIndex } = req.body;
    
    // Validate input
    if (!date || exerciseIndex === undefined) {
      return res.status(400).json({ msg: 'Please provide both date and exercise index' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find the workout in history
    const workoutIndex = user.workoutHistory.findIndex(w => w.date === date);
    if (workoutIndex === -1) {
      return res.status(404).json({ msg: 'Workout not found in history' });
    }
    
    const workout = user.workoutHistory[workoutIndex];
    
    // Validate exercise index
    if (exerciseIndex < 0 || exerciseIndex >= workout.exercises.length) {
      return res.status(400).json({ msg: 'Invalid exercise index' });
    }
    
    // Remove exercise and update totals
    const removedExercise = workout.exercises[exerciseIndex];
    workout.exercises.splice(exerciseIndex, 1);
    workout.totalCalories -= removedExercise.calories;
    workout.totalDuration -= removedExercise.duration;
    
    // If no exercises left, remove the entire workout
    if (workout.exercises.length === 0) {
      user.workoutHistory.splice(workoutIndex, 1);
    }
    
    await user.save();
    res.json({ history: user.workoutHistory });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 