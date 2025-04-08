import React, { useState, useEffect } from 'react';
import { Heart, Activity, X, BarChart, Plus, Edit2, CheckCircle, Zap, ChevronsUp } from 'lucide-react';
import { CircularProgressbar } from 'react-circular-progressbar';

const Home = () => {
  // State for the steps and goal
  const [steps, setSteps] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userGoal, setUserGoal] = useState('Weight loss');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingStepGoal, setIsEditingStepGoal] = useState(false);
  const [isAddingSteps, setIsAddingSteps] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [calories, setCalories] = useState(0);
  const [userGoals, setUserGoals] = useState({
    dailyStepGoal: 10000,
    dailyCalorieGoal: 2000,
    goal: 'Weight loss'
  });
  const [macros, setMacros] = useState({
    protein: 0,
    carbs: 0,
    fats: 0
  });

  // Predefined goal options
  const goalOptions = ['Weight loss', 'Muscle gain', 'Endurance', 'Flexibility', 'Overall fitness'];

  // Get formatted date for step tracking
  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCurrentDate(formattedDate);
  }, []);

  // Fetch user data from MongoDB
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch user goals first
        const goalsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/goals`, {
          credentials: 'include'
        });
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setUserGoals(goalsData);
          setDailyGoal(goalsData.dailyStepGoal || 10000);
          setUserGoal(goalsData.goal || 'Weight loss');
        }

        // Fetch user data
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/auth/user`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        if (userData.user) {
          setName(userData.user.name || 'Guest');
          
          // Get today's step count if available
          if (userData.user.stepHistory && userData.user.stepHistory[currentDate]) {
            setSteps(userData.user.stepHistory[currentDate]);
          } else {
            setSteps(0);
          }
        }
        
        // Fetch nutrition data
        const nutritionResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/nutrition`, {
          credentials: 'include'
        });
        if (nutritionResponse.ok) {
          const nutritionData = await nutritionResponse.json();
          console.log('Nutrition data:', nutritionData); // Debug log
          
          // Get today's data
          const today = new Date().toISOString().split('T')[0];
          const todayData = nutritionData.dailyTotals.find(day => day.date === today);
          
          if (todayData) {
            // Set calories from today's data
            setCalories(todayData.totalCalories || 0);
            
            // Set macros from today's data
            setMacros({
              protein: todayData.totalProtein || 0,
              carbs: todayData.totalCarbs || 0,
              fats: todayData.totalFat || 0
            });
          } else {
            // If no data for today, set defaults
            setCalories(0);
            setMacros({ protein: 0, carbs: 0, fats: 0 });
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setIsLoading(false);
        // Set defaults on error
        setName('Guest');
        setSteps(0);
        setCalories(0);
        setMacros({ protein: 0, carbs: 0, fats: 0 });
      }
    };
    
    if (currentDate) {
      fetchUserData();
      // Set up an interval to refresh nutrition data every 30 seconds
      const intervalId = setInterval(fetchUserData, 30000);
      return () => clearInterval(intervalId);
    }
  }, [currentDate]);

  // Function to fetch recommendations
  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/recommendations`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Fetch recommendations when component mounts or when relevant data changes
  useEffect(() => {
    fetchRecommendations();
  }, [userGoal, steps, dailyGoal]); // Refetch when goal, steps, or daily goal changes

  // Update user goal in MongoDB
  const handleGoalChange = async (goal) => {
    setUserGoal(goal);
    setIsEditingGoal(false);
    
    try {
      // Calculate new goals based on selected goal
      let newStepGoal = 10000; // Default
      let newCalorieGoal = 2000; // Default

      switch (goal) {
        case 'Weight loss':
          newStepGoal = 12000; // More steps for weight loss
          newCalorieGoal = 1500; // Lower calories for weight loss
          break;
        case 'Muscle gain':
          newStepGoal = 8000; // Less steps, focus on strength
          newCalorieGoal = 2500; // Higher calories for muscle gain
          break;
        case 'Endurance':
          newStepGoal = 15000; // More steps for endurance
          newCalorieGoal = 2200; // Moderate calories for endurance
          break;
        case 'Flexibility':
          newStepGoal = 7000; // Less steps, focus on flexibility
          newCalorieGoal = 2000; // Standard calories
          break;
        case 'Overall fitness':
          newStepGoal = 10000; // Balanced approach
          newCalorieGoal = 2000; // Standard calories
          break;
        default:
          newStepGoal = 10000;
          newCalorieGoal = 2000;
      }

      // Update both goals in one request
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/updateGoal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          goal,
          dailyStepGoal: newStepGoal,
          dailyCalorieGoal: newCalorieGoal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      // Update local state with new goals
      setUserGoals(prev => ({
        ...prev,
        goal,
        dailyStepGoal: newStepGoal,
        dailyCalorieGoal: newCalorieGoal
      }));
      setDailyGoal(newStepGoal);

      // Fetch updated nutrition data
      const nutritionResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/nutrition`, {
        credentials: 'include'
      });
      if (nutritionResponse.ok) {
        const nutritionData = await nutritionResponse.json();
        setCalories(nutritionData.totalCalories || 0);
      }

    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  // Update step goal in MongoDB
  const handleStepGoalChange = async (e) => {
    e.preventDefault();
    const newGoal = parseInt(e.target.stepGoal.value);
    if (newGoal > 0) {
      setDailyGoal(newGoal);
      setIsEditingStepGoal(false);
      
      try {
        await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/updateStepGoal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ dailyStepGoal: newGoal }),
        });
      } catch (err) {
        console.error("Error updating step goal:", err);
      }
    }
  };

  // Handle adding steps manually and update in MongoDB
  const handleAddSteps = async (e) => {
    e.preventDefault();
    const additionalSteps = parseInt(e.target.additionalSteps.value);
    if (additionalSteps > 0) {
      const newTotal = steps + additionalSteps;
      setSteps(newTotal);
      setIsAddingSteps(false);
      
      try {
        await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/updateSteps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            date: currentDate,
            steps: newTotal 
          }),
        });
      } catch (err) {
        console.error("Error updating steps:", err);
      }
    }
  };

  // Reset steps to zero for today only in MongoDB
  const handleResetSteps = async () => {
    setSteps(0);
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com'}/api/user/resetDailySteps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          date: currentDate 
        }),
      });
    } catch (err) {
      console.error("Error resetting steps:", err);
    }
  };

  // Calculate progress percentages with proper checks
  const stepsPercentage = Math.min(Math.round((steps / (userGoals.dailyStepGoal || 10000)) * 100), 100);
  const caloriesPercentage = Math.min(Math.round((calories / (userGoals.dailyCalorieGoal || 2000)) * 100), 100);

  // Add safety checks for display values
  const displaySteps = isNaN(steps) ? 0 : steps;
  const displayCalories = isNaN(calories) ? 0 : calories;
  const displayStepGoal = isNaN(userGoals.dailyStepGoal) ? 10000 : userGoals.dailyStepGoal;
  const displayCalorieGoal = isNaN(userGoals.dailyCalorieGoal) ? 2000 : userGoals.dailyCalorieGoal;

  // Calculate macro percentages
  const calculateMacroPercentage = (calories, totalCalories) => {
    if (!totalCalories || totalCalories === 0) return 0;
    return Math.round((calories / totalCalories) * 100);
  };

  // Calculate macro progress
  const calculateMacroProgress = (calories, targetCalories) => {
    if (!targetCalories || targetCalories === 0) return 0;
    return Math.min(Math.round((calories / targetCalories) * 100), 100);
  };

  // Calculate target calories for each macro
  const targetProteinCalories = userGoals.dailyCalorieGoal * 0.4;
  const targetCarbsCalories = userGoals.dailyCalorieGoal * 0.4;
  const targetFatsCalories = userGoals.dailyCalorieGoal * 0.2;

  // Calculate current calories from macros
  const proteinCalories = macros.protein * 4;
  const carbsCalories = macros.carbs * 4;
  const fatsCalories = macros.fats * 9;

  // Calculate total calories from macros
  const totalCaloriesFromMacros = proteinCalories + carbsCalories + fatsCalories;

  // Calculate macro percentages
  const proteinPercentage = calculateMacroPercentage(proteinCalories, totalCaloriesFromMacros);
  const carbsPercentage = calculateMacroPercentage(carbsCalories, totalCaloriesFromMacros);
  const fatsPercentage = calculateMacroPercentage(fatsCalories, totalCaloriesFromMacros);

  // Calculate macro progress
  const proteinProgress = calculateMacroProgress(proteinCalories, targetProteinCalories);
  const carbsProgress = calculateMacroProgress(carbsCalories, targetCarbsCalories);
  const fatsProgress = calculateMacroProgress(fatsCalories, targetFatsCalories);

  // Add debug logging
  console.log('Macros:', macros);
  console.log('Calories from macros:', { proteinCalories, carbsCalories, fatsCalories });
  console.log('Total calories from macros:', totalCaloriesFromMacros);
  console.log('Target calories:', { targetProteinCalories, targetCarbsCalories, targetFatsCalories });
  console.log('Percentages:', { proteinPercentage, carbsPercentage, fatsPercentage });
  console.log('Progress:', { proteinProgress, carbsProgress, fatsProgress });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content Area */}
      <main className="pt-20 pb-8">
        {/* Welcome Banner */}
        <section className="relative bg-gradient-to-b from-blue-900 to-black py-16 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-blue-500 to-transparent opacity-10"></div>
            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-20 h-20 rounded-full bg-blue-400 opacity-10 blur-lg"></div>
          </div>
          
          <div className="relative container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold">
              {isLoading ? 'Loading...' : `Welcome, ${name}`}
            </h1>
            <div className="mt-6 inline-flex items-center bg-black bg-opacity-40 px-4 py-2 rounded-full">
              <p className="text-lg text-gray-300">Your goal: </p>
              {isEditingGoal ? (
                <div className="ml-2 flex items-center">
                  <select 
                    className="bg-gray-800 text-white px-2 py-1 rounded"
                    value={userGoal}
                    onChange={(e) => handleGoalChange(e.target.value)}
                  >
                    {goalOptions.map((goal) => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select>
                  <button 
                    className="ml-2 text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    onClick={() => setIsEditingGoal(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="ml-2 font-medium text-blue-300">{userGoal}</span>
                  <button 
                    className="ml-2 text-sm text-blue-400 hover:text-blue-300"
                    onClick={() => setIsEditingGoal(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a href="/workouts">
                <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition duration-300 shadow-lg shadow-blue-500/20">
                  <Activity className="h-5 w-5 mr-2" /> Start Workout
                </button>
              </a>
              <a href="/nutrition">
                <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition duration-300 shadow-lg shadow-blue-500/20">
                  <Heart className="h-5 w-5 mr-2" /> Track Nutrition
                </button>
              </a>
              <a href="/progress">
                <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition duration-300 shadow-lg shadow-blue-500/20">
                  <BarChart className="h-5 w-5 mr-2" /> Check Progress
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <section className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Steps Counter Card */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-white flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-blue-400 mr-2" /> Steps Counter
                <span className="ml-2 text-sm text-gray-400">({currentDate})</span>
              </div>
              <button 
                onClick={handleResetSteps}
                className="text-sm px-2 py-1 bg-red-600 bg-opacity-60 rounded-md hover:bg-opacity-100 transition-colors"
              >
                Reset Today
              </button>
            </h2>
            
            <div className="flex flex-col items-center mt-6">
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-bold mb-2">Daily Steps</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold">{displaySteps}</p>
                    <p className="text-gray-400">of {displayStepGoal} steps</p>
                  </div>
                  <div className="w-16 h-16">
                    <CircularProgressbar
                      value={stepsPercentage}
                      text={`${stepsPercentage}%`}
                      styles={{
                        path: { stroke: '#3B82F6' },
                        text: { fill: '#fff' }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xl">
                <span className="font-bold text-blue-400">{steps.toLocaleString()}</span> / {dailyGoal.toLocaleString()} steps
              </div>
              
              <div className="mt-4 flex items-center">
                <span className="text-gray-300">Daily Goal:</span>
                {isEditingStepGoal ? (
                  <form onSubmit={handleStepGoalChange} className="ml-2 inline-flex items-center">
                    <input 
                      type="number" 
                      name="stepGoal"
                      defaultValue={dailyGoal}
                      min="1"
                      className="w-24 px-2 py-1 bg-gray-700 text-white rounded"
                    />
                    <button type="submit" className="ml-2 text-blue-400 hover:text-blue-300">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button 
                      type="button" 
                      className="ml-1 text-blue-400 hover:text-blue-300"
                      onClick={() => setIsEditingStepGoal(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center">
                    <span className="ml-2 font-medium">{dailyGoal.toLocaleString()}</span>
                    <button 
                      className="ml-2 text-blue-400 hover:text-blue-300"
                      onClick={() => setIsEditingStepGoal(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Manual Step Entry Section */}
              {isAddingSteps ? (
                <div className="mt-6 w-full">
                  <form onSubmit={handleAddSteps} className="flex flex-wrap items-center justify-center gap-2">
                    <div className="flex-1 min-w-0">
                      <input 
                        type="number" 
                        name="additionalSteps"
                        placeholder="Enter steps"
                        min="1"
                        required
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="submit"
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsAddingSteps(false)}
                        className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition flex items-center"
                  onClick={() => setIsAddingSteps(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Steps Manually
                </button>
              )}
            </div>
          </div>

          {/* Nutrition Overview Card */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Heart className="h-6 w-6 text-blue-400 mr-2" /> Nutrition Overview
            </h2>
            
            <div className="flex flex-col items-center mt-6">
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-bold mb-2">Nutrition</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold">{displayCalories}</p>
                    <p className="text-gray-400">of {displayCalorieGoal} calories</p>
                  </div>
                  <div className="w-16 h-16">
                    <CircularProgressbar
                      value={caloriesPercentage}
                      text={`${caloriesPercentage}%`}
                      styles={{
                        path: { stroke: '#3B82F6' },
                        text: { fill: '#fff' }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-6">
                <h3 className="text-lg font-medium text-gray-300 mb-3">Macronutrient Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-full h-24 bg-gray-700 rounded-t-lg relative"
                    >
                      <div 
                        className="absolute bottom-0 w-full bg-blue-600 rounded-b-lg transition-all duration-300"
                        style={{ 
                          height: `${proteinProgress}%`,
                          backgroundColor: proteinProgress > 100 ? '#EF4444' : '#3B82F6'
                        }}
                      ></div>
                    </div>
                    <div className="bg-gray-700 rounded-b-lg p-3 text-center w-full">
                      <div className="font-bold text-lg">{proteinPercentage}%</div>
                      <div className="text-sm text-gray-400">Protein ({macros.protein}g)</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-full h-24 bg-gray-700 rounded-t-lg relative"
                    >
                      <div 
                        className="absolute bottom-0 w-full bg-green-600 rounded-b-lg transition-all duration-300"
                        style={{ 
                          height: `${carbsProgress}%`,
                          backgroundColor: carbsProgress > 100 ? '#EF4444' : '#22C55E'
                        }}
                      ></div>
                    </div>
                    <div className="bg-gray-700 rounded-b-lg p-3 text-center w-full">
                      <div className="font-bold text-lg">{carbsPercentage}%</div>
                      <div className="text-sm text-gray-400">Carbs ({macros.carbs}g)</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-full h-24 bg-gray-700 rounded-t-lg relative"
                    >
                      <div 
                        className="absolute bottom-0 w-full bg-red-600 rounded-b-lg transition-all duration-300"
                        style={{ 
                          height: `${fatsProgress}%`,
                          backgroundColor: fatsProgress > 100 ? '#EF4444' : '#EF4444'
                        }}
                      ></div>
                    </div>
                    <div className="bg-gray-700 rounded-b-lg p-3 text-center w-full">
                      <div className="font-bold text-lg">{fatsPercentage}%</div>
                      <div className="text-sm text-gray-400">Fats ({macros.fats}g)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <a href="/nutrition" className="mt-6">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> Track Nutrition
                </button>
              </a>
            </div>
          </div>
        </section>
        
        {/* AI Recommendation Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
            
            <h3 className="text-2xl font-semibold text-white flex items-center">
              <Zap className="h-6 w-6 text-yellow-300 mr-2" /> AI Recommendation
            </h3>
            
            <div className="mt-4 text-lg text-gray-100 relative z-10">
              {isLoadingRecommendations ? (
                <p>Loading personalized recommendations...</p>
              ) : recommendations.length > 0 ? (
                <div>
                  {recommendations.map((recommendation, index) => (
                    <p key={index} className="mb-4">{recommendation}</p>
                  ))}
                </div>
              ) : (
                <p>No recommendations available at the moment.</p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={fetchRecommendations}
                className="px-6 py-2 bg-black bg-opacity-30 text-white rounded-lg hover:bg-opacity-40 transition flex items-center"
              >
                <ChevronsUp className="h-4 w-4 mr-2" /> Get More Tips
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Heart className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold ml-2">Syncfit</span>
            </div>
            
            <div className="flex space-x-6 mb-6 md:mb-0">
              <a href="/about" className="text-gray-400 hover:text-blue-400 transition">About</a>
              {/* <a href="/privacy" className="text-gray-400 hover:text-blue-400 transition">Privacy</a>
              <a href="/terms" className="text-gray-400 hover:text-blue-400 transition">Terms</a> */}
              <a href="/feedback" className="text-gray-400 hover:text-blue-400 transition">Feedback</a>
            </div>
            
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-blue-400 transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="https://twitter.com" className="text-gray-400 hover:text-blue-400 transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              
              <a href="https://instagram.com" className="text-gray-400 hover:text-blue-400 transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Syncfit. All rights reserved.</p>
            <p className="mt-2">Designed with ❤️ for fitness enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;