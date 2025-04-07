const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Store emails in lowercase
    trim: true,      // Remove whitespace
  },
  password: {
    type: String,
    required: true,
  },
  dailyStepGoal: {
    type: Number,
    default: 10000
  },
  stepHistory: {
    type: Map,
    of: Number,
    default: new Map()
  },
  goal: {
    type: String,
    enum: ['Weight loss', 'Muscle gain', 'Endurance', 'Flexibility', 'Overall fitness'],
    default: 'Weight loss'
  },
  dailyCalorieTarget: {
    type: Number,
    default: 2000
  },
  milestones: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  meals: [{
    name: String,
    calories: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fat: Number
    },
    mealTime: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  nutritionHistory: [{
    date: String,
    totalCalories: Number,
    meals: [{
      name: String,
      calories: Number,
      macros: {
        protein: Number,
        carbs: Number,
        fat: Number
      },
      mealTime: String,
      date: Date
    }]
  }],
  workouts: [{
    date: {
      type: String,
      required: true
    },
    exercises: [{
      name: {
        type: String,
        required: true
      },
      focus: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      calories: {
        type: Number,
        required: true
      }
    }],
    totalCalories: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    totalWorkouts: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  workoutHistory: [{
    date: {
      type: String,
      required: true
    },
    exercises: [{
      name: {
        type: String,
        required: true
      },
      focus: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      calories: {
        type: Number,
        required: true
      }
    }],
    totalCalories: {
      type: Number,
      required: true
    },
    totalDuration: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Hash password before saving to the database
userSchema.pre('save', async function(next) {
  // Only hash the password if it is modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Hashing password in model pre-save hook');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully in model');
    next();
  } catch (err) {
    console.error('Error hashing password in model:', err);
    next(err);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;