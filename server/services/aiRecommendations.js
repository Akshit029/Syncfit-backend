const User = require('../models/User');
const FitnessData = require('../models/FitnessData');

// Helper function to calculate average steps for the last 7 days
const calculateAverageSteps = (stepHistory) => {
  const today = new Date();
  const last7Days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(dateStr);
  }
  
  const steps = last7Days
    .map(date => stepHistory.get(date) || 0)
    .reduce((sum, steps) => sum + steps, 0);
    
  return Math.round(steps / 7);
};

// Helper function to calculate step consistency
const calculateStepConsistency = (stepHistory) => {
  const today = new Date();
  const last7Days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(dateStr);
  }
  
  const daysWithSteps = last7Days.filter(date => {
    const steps = stepHistory.get(date);
    return steps && steps > 0;
  }).length;
  
  return (daysWithSteps / 7) * 100; // Percentage of days with steps
};

// Helper function to calculate workout consistency
const calculateWorkoutConsistency = (fitnessData) => {
  if (!fitnessData || !fitnessData.workoutsCompleted) return 0;
  return fitnessData.workoutsCompleted;
};

// Helper function to get step trend
const getStepTrend = (stepHistory) => {
  const today = new Date();
  const last3Days = [];
  
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last3Days.push(dateStr);
  }
  
  const steps = last3Days.map(date => stepHistory.get(date) || 0);
  
  const trend = steps[0] - steps[2]; // Compare today with 2 days ago
  
  if (trend > 1000) return 'increasing';
  if (trend < -1000) return 'decreasing';
  return 'stable';
};

// Helper function to get today's steps
const getTodaySteps = (stepHistory) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return stepHistory.get(todayStr) || 0;
};

// Generate personalized recommendations based on user data
const generateRecommendations = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get fitness data
    const fitnessData = await FitnessData.findOne({ userId });
    
    // Calculate metrics
    const avgSteps = calculateAverageSteps(user.stepHistory);
    const stepConsistency = calculateStepConsistency(user.stepHistory);
    const workoutConsistency = calculateWorkoutConsistency(fitnessData);
    const currentGoal = user.goal;
    const dailyStepGoal = user.dailyStepGoal;
    const stepTrend = getStepTrend(user.stepHistory);
    const todaySteps = getTodaySteps(user.stepHistory);

    // Generate recommendations based on goal and metrics
    let recommendations = [];

    // Today's step progress
    if (todaySteps >= dailyStepGoal) {
      recommendations.push(`Great job! You've reached your daily step goal of ${dailyStepGoal} steps! Keep up the momentum!`);
    } else if (todaySteps > 0) {
      const remainingSteps = dailyStepGoal - todaySteps;
      recommendations.push(`You're making progress! You have ${remainingSteps} steps remaining to reach your daily goal of ${dailyStepGoal} steps.`);
    }

    // Step-based recommendations
    if (stepConsistency < 50) {
      recommendations.push('You\'re not consistently meeting your daily step goals. Try setting reminders or using a step tracker app to stay motivated.');
    } else if (stepTrend === 'decreasing') {
      recommendations.push('Your step count has been decreasing lately. Try to maintain your activity level by taking regular breaks to walk.');
    } else if (stepTrend === 'increasing') {
      recommendations.push('Great job! Your step count is increasing. Keep up the momentum by maintaining this positive trend.');
    }

    // Goal-specific recommendations
    switch (currentGoal) {
      case 'Weight loss':
        if (avgSteps < dailyStepGoal * 0.7) {
          recommendations.push('Your average step count is below target. Try taking short walks during breaks or parking further from your destination to increase daily activity.');
        }
        if (workoutConsistency < 3) {
          recommendations.push('Increasing workout frequency to 3-4 times per week can significantly boost your weight loss progress.');
        }
        if (stepConsistency > 80) {
          recommendations.push('You\'re consistently hitting your step goals! Consider adding more high-intensity interval training (HIIT) sessions to maximize calorie burn.');
        }
        break;

      case 'Muscle gain':
        if (workoutConsistency < 4) {
          recommendations.push('For optimal muscle growth, aim for 4-5 strength training sessions per week.');
        }
        if (stepConsistency > 70) {
          recommendations.push('While your step count is good, remember to balance cardio with strength training for muscle growth.');
        }
        recommendations.push('Focus on progressive overload by gradually increasing weights or reps in your exercises.');
        break;

      case 'Endurance':
        if (avgSteps < dailyStepGoal * 0.8) {
          recommendations.push('Your average activity level could be improved. Try incorporating more cardio activities like running or cycling.');
        }
        if (stepConsistency > 60) {
          recommendations.push('You\'re maintaining good activity levels. Add interval training sessions to improve your cardiovascular capacity.');
        }
        recommendations.push('Consider increasing your workout duration gradually to build endurance.');
        break;

      case 'Flexibility':
        if (workoutConsistency < 2) {
          recommendations.push('Aim for at least 2-3 flexibility sessions per week to see improvements.');
        }
        if (stepConsistency > 70) {
          recommendations.push('While your step count is good, remember to include dedicated stretching sessions in your routine.');
        }
        recommendations.push('Try incorporating dynamic stretching before workouts and static stretching after.');
        break;

      case 'Overall fitness':
        if (avgSteps < dailyStepGoal * 0.7) {
          recommendations.push('Your average activity level needs improvement. Try to be more active throughout the day.');
        }
        if (workoutConsistency < 3) {
          recommendations.push('Aim for at least 3-4 balanced workouts per week combining cardio and strength training.');
        }
        if (stepConsistency > 80) {
          recommendations.push('You\'re maintaining excellent activity levels! Consider adding more variety to your workouts.');
        }
        break;
    }

    // Add motivational recommendations based on progress
    if (stepConsistency > 90 && workoutConsistency > 4) {
      recommendations.push('You\'re showing excellent commitment to your fitness goals! Keep up the great work!');
    }

    // Return the recommendations
    return {
      success: true,
      recommendations: recommendations.slice(0, 3), // Return top 3 most relevant recommendations
      metrics: {
        averageSteps: avgSteps,
        stepConsistency,
        workoutConsistency,
        dailyStepGoal,
        stepTrend,
        todaySteps
      }
    };

  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

module.exports = {
  generateRecommendations
}; 