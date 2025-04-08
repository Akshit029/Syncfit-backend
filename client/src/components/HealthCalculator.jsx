import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HealthCalculator = () => {
  const navigate = useNavigate();
  // States for form inputs
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [activeTab, setActiveTab] = useState('bmi');
  const [showGoalSelection, setShowGoalSelection] = useState(false);
  
  // States for results
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [calories, setCalories] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('');

  // Predefined goal options
  const goalOptions = [
    { id: 'Weight loss', description: 'Lose weight and improve body composition' },
    { id: 'Muscle gain', description: 'Build muscle and increase strength' },
    { id: 'Endurance', description: 'Improve cardiovascular fitness and stamina' },
    { id: 'Flexibility', description: 'Enhance flexibility and mobility' },
    { id: 'Overall fitness', description: 'Maintain overall health and fitness' }
  ];

  // Calculate BMI
  const calculateBMI = (e) => {
    e.preventDefault();
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
      
      // Set BMI category
      if (bmiValue < 18.5) setBmiCategory('Underweight');
      else if (bmiValue >= 18.5 && bmiValue < 24.9) setBmiCategory('Normal weight');
      else if (bmiValue >= 25 && bmiValue < 29.9) setBmiCategory('Overweight');
      else setBmiCategory('Obesity');
    }
  };

  // Calculate daily calorie needs
  const calculateCalories = (e) => {
    e.preventDefault();
    if (weight && height && age) {
      // Basal Metabolic Rate (BMR) calculation using Mifflin-St Jeor Equation
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Activity multiplier
      let activityMultiplier;
      switch (activityLevel) {
        case 'sedentary': activityMultiplier = 1.2; break;
        case 'light': activityMultiplier = 1.375; break;
        case 'moderate': activityMultiplier = 1.55; break;
        case 'active': activityMultiplier = 1.725; break;
        case 'veryActive': activityMultiplier = 1.9; break;
        default: activityMultiplier = 1.55;
      }
      
      setCalories(Math.round(bmr * activityMultiplier));
      setShowGoalSelection(true);
    }
  };

  // Handle goal selection and update user profile
  const handleGoalSelection = async (goal) => {
    setSelectedGoal(goal);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/updateGoal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          goal,
          dailyCalorieGoal: calories,
          bmi: bmi,
          bmiCategory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      // Navigate to home page after successful update
      navigate('/');
    } catch (err) {
      console.error('Error updating goal:', err);
      alert('Failed to update your goal. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setGender('male');
    setActivityLevel('moderate');
    setBmi(null);
    setBmiCategory('');
    setCalories(null);
    setShowGoalSelection(false);
    setSelectedGoal('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-gray-100">
      <div className="w-full max-w-lg mx-auto bg-gray-900 text-gray-100 items-center justify-center rounded-lg shadow-lg p-6">
        <div className="flex mb-6 border-b border-gray-700">
          <button 
            className={`py-2 px-4 ${activeTab === 'bmi' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('bmi')}
          >
            BMI Calculator
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'calories' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('calories')}
          >
            Calorie Calculator
          </button>
        </div>

        {activeTab === 'bmi' ? (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-400">BMI Calculator</h2>
            <form onSubmit={calculateBMI}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height in cm"
                  className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Weight in kg"
                  className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  required
                />
              </div>
              <div className="flex gap-2 mb-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Calculate BMI
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
              </div>
            </form>

            {bmi && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Your Results</h3>
                <div className="flex items-center justify-between mb-2">
                  <span>BMI:</span>
                  <span className="font-bold text-xl">{bmi}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className={`font-bold ${
                    bmiCategory === 'Normal weight' ? 'text-green-400' : 
                    bmiCategory === 'Underweight' ? 'text-yellow-400' : 
                    bmiCategory === 'Overweight' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {bmiCategory}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-blue-400">Daily Calorie Calculator</h2>
            <form onSubmit={calculateCalories}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height in cm"
                  className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Weight in kg"
                  className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age in years"
                  className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Gender</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                      className="mr-2"
                    />
                    Female
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                  <option value="veryActive">Very Active (intense exercise daily)</option>
                </select>
              </div>
              <div className="flex gap-2 mb-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Calculate Calories
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
              </div>
            </form>

            {calories && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Your Results</h3>
                <div className="flex items-center justify-between">
                  <span>Daily Calorie Needs:</span>
                  <span className="font-bold text-xl text-blue-400">{calories} calories</span>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  <p>To lose weight: {Math.round(calories * 0.8)} calories</p>
                  <p>To gain weight: {Math.round(calories * 1.2)} calories</p>
                </div>
              </div>
            )}

            {showGoalSelection && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Select Your Fitness Goal</h3>
                <div className="space-y-3">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleGoalSelection(goal.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selectedGoal === goal.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                      }`}
                    >
                      <div className="font-medium">{goal.id}</div>
                      <div className="text-sm opacity-75">{goal.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCalculator;