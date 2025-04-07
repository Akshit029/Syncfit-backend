const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const FitnessData = require('../models/FitnessData');
const NutritionData = require('../models/NutritionData');
const { generateRecommendations } = require('../services/aiRecommendations');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

// Update user's fitness goal
router.post('/updateGoal', auth, async (req, res) => {
  try {
    const { goal, dailyStepGoal, dailyCalorieGoal } = req.body;
    
    // Update user's goal and health metrics
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set appropriate daily step goal and calorie adjustments based on the selected goal
    let calorieMultiplier = 1;
    switch (goal) {
      case 'Weight loss':
        user.dailyStepGoal = 10000;
        calorieMultiplier = 0.8; // 20% calorie deficit
        break;
      case 'Muscle gain':
        user.dailyStepGoal = 8000;
        calorieMultiplier = 1.2; // 20% calorie surplus
        break;
      case 'Endurance':
        user.dailyStepGoal = 12000;
        calorieMultiplier = 1.1; // 10% calorie surplus
        break;
      case 'Flexibility':
        user.dailyStepGoal = 7000;
        calorieMultiplier = 1.0; // Maintain current calories
        break;
      case 'Overall fitness':
        user.dailyStepGoal = 10000;
        calorieMultiplier = 1.0; // Maintain current calories
        break;
      default:
        user.dailyStepGoal = 10000;
        calorieMultiplier = 1.0;
    }

    // Set the adjusted calorie goal based on the user's goal
    const baseCalories = dailyCalorieGoal || 2000; // Use provided calories or default to 2000
    user.dailyCalorieTarget = Math.round(baseCalories * calorieMultiplier);
    user.dailyCalorieGoal = user.dailyCalorieTarget; // Keep them in sync
    user.goal = goal;

    await user.save();

    // Update or create fitness data
    let fitnessData = await FitnessData.findOne({ userId: req.user.id });
    if (!fitnessData) {
      fitnessData = new FitnessData({
        userId: req.user.id,
        workoutsCompleted: 0,
        totalWorkoutTime: 0,
        caloriesBurned: 0,
        dailyStepGoal: user.dailyStepGoal,
        dailyCalorieGoal: user.dailyCalorieTarget
      });
    } else {
      fitnessData.dailyStepGoal = user.dailyStepGoal;
      fitnessData.dailyCalorieGoal = user.dailyCalorieTarget;
    }
    await fitnessData.save();

    // Update nutrition data
    let nutritionData = await NutritionData.findOne({ userId: req.user.id });
    if (!nutritionData) {
      nutritionData = new NutritionData({
        userId: req.user.id,
        dailyCalorieGoal: user.dailyCalorieTarget,
        meals: [],
        waterIntake: 0,
        waterGoal: 2000 // Default 2L water goal
      });
    } else {
      nutritionData.dailyCalorieGoal = user.dailyCalorieTarget;
    }
    await nutritionData.save();

    res.json({
      success: true,
      message: 'Goal updated successfully',
      user: {
        goal: user.goal,
        dailyCalorieTarget: user.dailyCalorieTarget,
        dailyStepGoal: user.dailyStepGoal
      }
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Error updating goal' });
  }
});

// Get user goals
router.get('/getUserGoals', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure we're using the correct calorie target
    const calorieTarget = user.dailyCalorieTarget || user.dailyCalorieGoal || 2000;

    res.json({
      goal: user.goal,
      dailyStepGoal: user.dailyStepGoal,
      dailyCalorieTarget: calorieTarget,
      dailyCalorieGoal: calorieTarget // Include both for backward compatibility
    });
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(500).json({ message: 'Error fetching user goals' });
  }
});

// Get user's nutrition data
router.get('/nutrition', auth, async (req, res) => {
  try {
    const nutritionData = await NutritionData.findOne({ userId: req.user.id });
    if (!nutritionData) {
      return res.json({ 
        meals: {
          Breakfast: [],
          'Morning Snack': [],
          Lunch: [],
          'Evening Snack': [],
          Dinner: []
        },
        dailyTotals: [],
        dailyCalorieGoal: 2000
      });
    }

    // Get the requested date from query parameters or use today's date
    const requestedDate = req.query.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    // Find data for the requested date
    let dateData = nutritionData.dailyTotals.find(day => day.date === requestedDate);
    if (!dateData) {
      // Create new data for the requested date with zero values
      dateData = {
        date: requestedDate,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: []
      };
      // Add the data to dailyTotals
      nutritionData.dailyTotals.push(dateData);
      await nutritionData.save();
    }

    // Group meals by meal time
    const groupedMeals = {
      Breakfast: [],
      'Morning Snack': [],
      Lunch: [],
      'Evening Snack': [],
      Dinner: []
    };

    if (dateData.meals && Array.isArray(dateData.meals)) {
      dateData.meals.forEach(meal => {
        const mealTime = meal.mealTime || 'Lunch';
        if (groupedMeals[mealTime]) {
          groupedMeals[mealTime].push(meal);
        }
      });
    }

    // Return the requested date's meals and the daily totals history
    res.json({
      meals: groupedMeals,
      dailyTotals: nutritionData.dailyTotals,
      dailyCalorieGoal: nutritionData.dailyCalorieGoal,
      today: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // Include today's date in response
    });
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({ message: 'Error fetching nutrition data' });
  }
});

// Get nutrition history
router.get('/nutrition/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.nutritionHistory || []);
  } catch (error) {
    console.error('Error fetching nutrition history:', error);
    res.status(500).json({ message: 'Error fetching nutrition history' });
  }
});

// Update calorie target
router.post('/updateCalorieTarget', auth, async (req, res) => {
  try {
    const { dailyCalorieTarget } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update both dailyCalorieTarget and dailyCalorieGoal
    user.dailyCalorieTarget = dailyCalorieTarget;
    user.dailyCalorieGoal = dailyCalorieTarget; // Keep them in sync

    // Also update the fitness data
    let fitnessData = await FitnessData.findOne({ userId: req.user.id });
    if (!fitnessData) {
      fitnessData = new FitnessData({
        userId: req.user.id,
        workoutsCompleted: 0,
        totalWorkoutTime: 0,
        caloriesBurned: 0,
        dailyStepGoal: user.dailyStepGoal || 10000,
        dailyCalorieGoal: dailyCalorieTarget
      });
    } else {
      fitnessData.dailyCalorieGoal = dailyCalorieTarget;
    }

    // Also update the nutrition data
    let nutritionData = await NutritionData.findOne({ userId: req.user.id });
    if (!nutritionData) {
      nutritionData = new NutritionData({
        userId: req.user.id,
        dailyCalorieGoal: dailyCalorieTarget,
        meals: [],
        waterIntake: 0,
        waterGoal: 2000
      });
    } else {
      nutritionData.dailyCalorieGoal = dailyCalorieTarget;
    }

    // Save all changes
    await Promise.all([
      user.save(),
      fitnessData.save(),
      nutritionData.save()
    ]);

    res.json({ 
      message: 'Calorie target updated successfully',
      dailyCalorieTarget: user.dailyCalorieTarget
    });
  } catch (error) {
    console.error('Error updating calorie target:', error);
    res.status(500).json({ message: 'Error updating calorie target' });
  }
});

// Add a meal
router.post('/nutrition/addMeal', auth, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, mealTime, date } = req.body;
    
    // Validate meal time
    const validMealTimes = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];
    if (!mealTime || !validMealTimes.includes(mealTime)) {
      return res.status(400).json({ message: 'Invalid meal time' });
    }
    
    // Get or create nutrition data for the user
    let nutritionData = await NutritionData.findOne({ userId: req.user.id });
    if (!nutritionData) {
      nutritionData = new NutritionData({
        userId: req.user.id,
        dailyCalorieGoal: 2000, // Default value
        dailyTotals: [],
        waterIntake: 0,
        waterGoal: 2000
      });
    }

    const newMeal = {
      name,
      calories,
      protein,
      carbs,
      fat: fats,
      mealTime,
      date: new Date(date || Date.now())
    };

    // Use the provided date or today's date in YYYY-MM-DD format
    const targetDate = date ? new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : 
                               new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    // Find or create the target date's data
    let dateData = nutritionData.dailyTotals.find(day => day.date === targetDate);
    if (!dateData) {
      // Create new data for the target date with zero values
      dateData = {
        date: targetDate,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: []
      };
      nutritionData.dailyTotals.push(dateData);
    }

    // Add the meal to the target date's data
    dateData.meals.push(newMeal);
    dateData.totalCalories += calories;
    dateData.totalProtein += protein;
    dateData.totalCarbs += carbs;
    dateData.totalFat += fats;

    // Update the dailyTotals array with the target date's data
    const dateIndex = nutritionData.dailyTotals.findIndex(day => day.date === targetDate);
    if (dateIndex !== -1) {
      nutritionData.dailyTotals[dateIndex] = dateData;
    }

    await nutritionData.save();
    res.json({
      ...newMeal,
      date: targetDate // Include the date in the response
    });
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ message: 'Error adding meal' });
  }
});

// Remove a meal
router.post('/nutrition/removeMeal', auth, async (req, res) => {
  try {
    const { mealId, date } = req.body;
    
    // Validate meal time
    const validMealTimes = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];
    if (!mealId.mealTime || !validMealTimes.includes(mealId.mealTime)) {
      return res.status(400).json({ message: 'Invalid meal time' });
    }
    
    // Find the nutrition data for the user
    const nutritionData = await NutritionData.findOne({ userId: req.user.id });
    if (!nutritionData) {
      return res.status(404).json({ message: 'Nutrition data not found' });
    }

    // Use the provided date or today's date in YYYY-MM-DD format
    const targetDate = date ? new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : 
                             new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    // Find the target date's data
    const dateData = nutritionData.dailyTotals.find(day => day.date === targetDate);
    if (!dateData) {
      return res.status(404).json({ message: 'No data found for the specified date' });
    }

    // Find the meal to remove by matching the meal properties
    const mealIndex = dateData.meals.findIndex(meal => 
      meal.name === mealId.name && 
      meal.calories === mealId.calories &&
      meal.mealTime === mealId.mealTime
    );

    if (mealIndex === -1) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const removedMeal = dateData.meals[mealIndex];
    
    // Update the date's totals
    dateData.totalCalories -= removedMeal.calories;
    dateData.totalProtein -= removedMeal.protein || 0;
    dateData.totalCarbs -= removedMeal.carbs || 0;
    dateData.totalFat -= removedMeal.fat || 0;
    
    // Remove the meal from the date's meals array
    dateData.meals.splice(mealIndex, 1);

    // Update the dailyTotals array with the date's data
    const dateIndex = nutritionData.dailyTotals.findIndex(day => day.date === targetDate);
    if (dateIndex !== -1) {
      nutritionData.dailyTotals[dateIndex] = dateData;
    }

    await nutritionData.save();
    res.json({ message: 'Meal removed successfully' });
  } catch (error) {
    console.error('Error removing meal:', error);
    res.status(500).json({ message: 'Error removing meal' });
  }
});

// Reset nutrition data for a specific date
router.post('/nutrition/resetDaily', auth, async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const nutritionData = await NutritionData.findOne({ userId: req.user.id });
    if (!nutritionData) {
      return res.status(404).json({ message: 'Nutrition data not found' });
    }

    // Reset data for the specific date to zero values
    const dateIndex = nutritionData.dailyTotals.findIndex(day => day.date === date);
    if (dateIndex !== -1) {
      nutritionData.dailyTotals[dateIndex] = {
        date: date,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: []
      };
    }

    await nutritionData.save();
    res.json({ 
      success: true, 
      message: 'Daily nutrition data reset successfully',
      date 
    });
  } catch (error) {
    console.error('Error resetting daily nutrition data:', error);
    res.status(500).json({ message: 'Error resetting daily nutrition data' });
  }
});

// Get comprehensive food database
router.get('/nutrition/foodDatabase', auth, async (req, res) => {
  try {
    console.log('Received request for food database');
    const { searchTerm = '' } = req.query;
    console.log('Search term:', searchTerm);
    
    // Comprehensive food database with common foods
    const foodDatabase = [
      // Breakfast Foods
      { name: 'Oatmeal', calories: 150, carbs: 27, protein: 5, fat: 3 },
      { name: 'Greek Yogurt', calories: 100, carbs: 6, protein: 17, fat: 0 },
      { name: 'Eggs (2)', calories: 140, carbs: 0, protein: 12, fat: 10 },
      { name: 'Whole Grain Toast', calories: 80, carbs: 15, protein: 4, fat: 1 },
      { name: 'Almond Milk', calories: 30, carbs: 1, protein: 1, fat: 3 },
      
      // Proteins
      { name: 'Chicken Breast', calories: 165, carbs: 0, protein: 31, fat: 3.6 },
      { name: 'Salmon', calories: 206, carbs: 0, protein: 22, fat: 13 },
      { name: 'Tuna', calories: 154, carbs: 0, protein: 30, fat: 1 },
      { name: 'Turkey Breast', calories: 135, carbs: 0, protein: 30, fat: 1 },
      { name: 'Tofu', calories: 144, carbs: 3, protein: 12, fat: 8 },
      
      // Grains
      { name: 'Brown Rice', calories: 216, carbs: 45, protein: 5, fat: 1.8 },
      { name: 'Quinoa', calories: 222, carbs: 39, protein: 8, fat: 3.6 },
      { name: 'Whole Wheat Pasta', calories: 200, carbs: 40, protein: 8, fat: 1 },
      { name: 'Sweet Potato', calories: 112, carbs: 26, protein: 2, fat: 0 },
      
      // Vegetables
      { name: 'Broccoli', calories: 55, carbs: 11, protein: 4, fat: 0.5 },
      { name: 'Spinach', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },
      { name: 'Carrots', calories: 41, carbs: 9.6, protein: 0.9, fat: 0.2 },
      { name: 'Bell Pepper', calories: 30, carbs: 7, protein: 1, fat: 0.3 },
      { name: 'Asparagus', calories: 20, carbs: 3.9, protein: 2.2, fat: 0.2 },
      
      // Fruits
      { name: 'Apple', calories: 95, carbs: 25, protein: 0.5, fat: 0.3 },
      { name: 'Banana', calories: 105, carbs: 27, protein: 1, fat: 0 },
      { name: 'Blueberries', calories: 84, carbs: 21, protein: 1, fat: 0.5 },
      { name: 'Orange', calories: 62, carbs: 15.4, protein: 1.2, fat: 0.2 },
      { name: 'Strawberries', calories: 49, carbs: 11.7, protein: 1, fat: 0.5 },
      
      // Snacks
      { name: 'Almonds', calories: 162, carbs: 6, protein: 6, fat: 14 },
      { name: 'Greek Yogurt with Honey', calories: 180, carbs: 20, protein: 15, fat: 5 },
      { name: 'Hummus', calories: 166, carbs: 14, protein: 7.9, fat: 9.6 },
      { name: 'Dark Chocolate', calories: 170, carbs: 13, protein: 2, fat: 12 },
      
      // Beverages
      { name: 'Green Tea', calories: 0, carbs: 0, protein: 0, fat: 0 },
      { name: 'Coffee (Black)', calories: 2, carbs: 0, protein: 0.3, fat: 0 },
      { name: 'Protein Shake', calories: 120, carbs: 3, protein: 24, fat: 1 },
      
      // Common Dishes
      { name: 'Caesar Salad', calories: 180, carbs: 8, protein: 6, fat: 14 },
      { name: 'Chicken Stir Fry', calories: 250, carbs: 15, protein: 25, fat: 12 },
      { name: 'Pizza Slice', calories: 285, carbs: 36, protein: 12, fat: 10 },
      { name: 'Burger', calories: 354, carbs: 29, protein: 20, fat: 17 },
      { name: 'Pasta with Tomato Sauce', calories: 200, carbs: 40, protein: 8, fat: 1 },
      
      // Healthy Alternatives
      { name: 'Zucchini Noodles', calories: 33, carbs: 6, protein: 2, fat: 0 },
      { name: 'Cauliflower Rice', calories: 25, carbs: 5, protein: 2, fat: 0 },
      { name: 'Kale Chips', calories: 50, carbs: 8, protein: 2, fat: 2 },
      { name: 'Avocado Toast', calories: 195, carbs: 15, protein: 5, fat: 14 },
      
      // International Cuisine
      { name: 'Sushi Roll', calories: 93, carbs: 18, protein: 2.9, fat: 0.7 },
      { name: 'Pad Thai', calories: 237, carbs: 32, protein: 12, fat: 8 },
      { name: 'Taco', calories: 210, carbs: 20, protein: 9, fat: 10 },
      { name: 'Curry with Rice', calories: 350, carbs: 45, protein: 15, fat: 12 }
    ];

    console.log('Total foods in database:', foodDatabase.length);

    // If no search term, return all foods
    if (!searchTerm) {
      console.log('No search term, returning all foods');
      return res.json(foodDatabase);
    }

    // Filter foods based on search term (case-insensitive)
    const searchResults = foodDatabase.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('Number of search results:', searchResults.length);
    console.log('Search results:', searchResults);

    res.json(searchResults);
  } catch (error) {
    console.error('Error in foodDatabase endpoint:', error);
    res.status(500).json({ message: 'Error fetching food database' });
  }
});

// Update user's daily step goal
router.post('/updateStepGoal', auth, async (req, res) => {
  try {
    const { dailyStepGoal } = req.body;
    
    if (!dailyStepGoal || dailyStepGoal < 0) {
      return res.status(400).json({ message: 'Invalid step goal' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { dailyStepGoal },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, dailyStepGoal: user.dailyStepGoal });
  } catch (err) {
    console.error('Error updating step goal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's steps for a specific date
router.post('/updateSteps', auth, async (req, res) => {
  try {
    const { date, steps } = req.body;
    
    if (!date || steps === undefined || steps < 0) {
      return res.status(400).json({ message: 'Invalid date or steps' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update steps for the specific date
    user.stepHistory.set(date, steps);
    await user.save();

    res.json({ 
      success: true, 
      steps: user.stepHistory.get(date),
      date 
    });
  } catch (err) {
    console.error('Error updating steps:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset steps for a specific date
router.post('/resetDailySteps', auth, async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset steps for the specific date to 0
    user.stepHistory.set(date, 0);
    await user.save();

    res.json({ 
      success: true, 
      steps: 0,
      date 
    });
  } catch (err) {
    console.error('Error resetting steps:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user progress data
router.get('/progress', auth, async (req, res) => {
  try {
    // Get user fitness data
    const fitnessData = await FitnessData.findOne({ userId: req.user.id });
    
    // Get user nutrition data
    const nutritionData = await NutritionData.findOne({ userId: req.user.id });
    
    // Initialize default data if no fitness or nutrition data exists
    if (!fitnessData || !nutritionData) {
      return res.json({
        weightHistory: [],
        calorieHistory: [],
        goalProgress: 0,
        goalProgressChange: 0
      });
    }
    
    // Format weight history
    const weightHistory = fitnessData.weightHistory.map(entry => ({
      date: entry.date,
      weight: entry.weight,
      weightChange: entry.weightChange
    }));
    
    // Format calorie history
    const calorieHistory = fitnessData.calorieHistory.map(entry => ({
      date: entry.date,
      calories: entry.calories
    }));
    
    // Calculate goal progress
    const goalProgress = fitnessData.goalProgress || 0;
    const goalProgressChange = fitnessData.goalProgressChange || 0;
    
    // Return the data
    res.json({
      weightHistory,
      calorieHistory,
      goalProgress,
      goalProgressChange
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update nutrition data daily calorie goal
router.post('/nutrition/updateCalorieGoal', auth, async (req, res) => {
  try {
    const { dailyCalorieGoal } = req.body;
    
    if (!dailyCalorieGoal || dailyCalorieGoal < 0) {
      return res.status(400).json({ message: 'Invalid calorie goal' });
    }

    // Find the user's nutrition data
    let nutritionData = await NutritionData.findOne({ userId: req.user.id });
    
    if (!nutritionData) {
      // Create new nutrition data if it doesn't exist
      nutritionData = new NutritionData({
        userId: req.user.id,
        dailyCalorieGoal,
        dailyTotals: [],
        waterIntake: 0,
        waterGoal: 2000
      });
    } else {
      // Update the daily calorie goal
      nutritionData.dailyCalorieGoal = dailyCalorieGoal;
    }
    
    await nutritionData.save();
    
    // Also update the user's daily calorie target
    const user = await User.findById(req.user.id);
    if (user) {
      user.dailyCalorieTarget = dailyCalorieGoal;
      user.dailyCalorieGoal = dailyCalorieGoal;
      await user.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Daily calorie goal updated successfully',
      dailyCalorieGoal: nutritionData.dailyCalorieGoal
    });
  } catch (error) {
    console.error('Error updating daily calorie goal:', error);
    res.status(500).json({ message: 'Error updating daily calorie goal' });
  }
});

// Get AI recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const result = await generateRecommendations(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Error getting recommendations' });
  }
});

module.exports = router; 