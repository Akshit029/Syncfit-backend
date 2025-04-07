// models/FitnessData.js
const mongoose = require('mongoose');

const fitnessDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  weightHistory: [{
    date: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    weightChange: {
      type: Number,
      default: 0
    }
  }],
  calorieHistory: [{
    date: {
      type: String,
      required: true
    },
    calories: {
      type: Number,
      required: true
    }
  }],
  goalProgress: {
    type: Number,
    default: 0
  },
  goalProgressChange: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate weight changes
fitnessDataSchema.pre('save', function(next) {
  if (this.weightHistory && this.weightHistory.length > 1) {
    // Sort weight history by date
    this.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate weight changes
    for (let i = 1; i < this.weightHistory.length; i++) {
      const currentWeight = this.weightHistory[i].weight;
      const previousWeight = this.weightHistory[i-1].weight;
      this.weightHistory[i].weightChange = previousWeight - currentWeight;
    }
    
    // Calculate goal progress based on weight change
    const startWeight = this.weightHistory[0].weight;
    const currentWeight = this.weightHistory[this.weightHistory.length - 1].weight;
    const weightLost = startWeight - currentWeight;
    
    // Assuming a goal of 10kg weight loss (can be adjusted based on user's goal)
    const weightLossGoal = 10;
    const newGoalProgress = Math.min(Math.round((weightLost / weightLossGoal) * 100), 100);
    
    // Calculate goal progress change
    this.goalProgressChange = newGoalProgress - this.goalProgress;
    this.goalProgress = newGoalProgress;
  }
  
  next();
});

const FitnessData = mongoose.model('FitnessData', fitnessDataSchema);

module.exports = FitnessData;
