const mongoose = require('mongoose');

const nutritionDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dailyCalorieGoal: {
    type: Number,
    default: 2000
  },
  dailyTotals: [{
    date: {
      type: String,
      required: true
    },
    totalCalories: {
      type: Number,
      default: 0
    },
    totalProtein: {
      type: Number,
      default: 0
    },
    totalCarbs: {
      type: Number,
      default: 0
    },
    totalFat: {
      type: Number,
      default: 0
    },
    waterIntake: {
      type: Number,
      default: 0
    },
    meals: [{
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      mealTime: {
        type: String,
        enum: ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'],
        default: 'Lunch'
      }
    }]
  }],
  waterIntake: {
    type: Number,
    default: 0
  },
  waterGoal: {
    type: Number,
    default: 2000
  }
}, {
  timestamps: true
});

// Pre-save middleware to validate meal times
nutritionDataSchema.pre('save', function(next) {
  const validMealTimes = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];
  
  // Validate meal times in dailyTotals
  this.dailyTotals.forEach(day => {
    if (day.meals) {
      day.meals.forEach(meal => {
        if (!meal.mealTime || !validMealTimes.includes(meal.mealTime)) {
          meal.mealTime = 'Lunch'; // Default to Lunch if invalid
        }
      });
    }
  });
  
  next();
});

const NutritionData = mongoose.model('NutritionData', nutritionDataSchema);

module.exports = NutritionData; 