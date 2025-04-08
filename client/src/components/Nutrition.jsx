import React, { useState, useEffect } from 'react';

const Nutrition = () => {
  // State for user's meal plan
  const [mealPlan, setMealPlan] = useState({
    Breakfast: [],
    'Morning Snack': [],
    Lunch: [],
    'Evening Snack': [],
    Dinner: []
  });

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentMealTime, setCurrentMealTime] = useState('Breakfast');
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(2000);
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'summary', 'plan'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);

  // Meal times
  const mealTimes = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];

  // Calculate total calories and macros
  const calculateTotals = () => {
    let totalCal = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;

    // Ensure mealPlan is an object and has the expected structure
    if (mealPlan && typeof mealPlan === 'object') {
      Object.values(mealPlan).forEach(mealItems => {
        // Ensure mealItems is an array
        if (Array.isArray(mealItems)) {
          mealItems.forEach(item => {
            totalCal += item.calories || 0;
            totalCarbs += item.carbs || 0;
            totalProtein += item.protein || 0;
            totalFat += item.fat || 0;
          });
        }
      });
    }

    return {
      calories: totalCal,
      macros: {
        carbs: totalCarbs,
        protein: totalProtein,
        fat: totalFat
      }
    };
  };

  const totals = calculateTotals();
  
  // Calculate macros percentages for display
  const macroPercentages = {
    carbs: totals.calories > 0 ? Math.round((totals.macros.carbs * 4 / totals.calories) * 100) : 0,
    protein: totals.calories > 0 ? Math.round((totals.macros.protein * 4 / totals.calories) * 100) : 0,
    fat: totals.calories > 0 ? Math.round((totals.macros.fat * 9 / totals.calories) * 100) : 0
  };

  // Handle search - now uses the server's food database with search terms
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        console.log('Fetching search results for:', searchTerm);
        const response = await fetch(`/api/user/nutrition/foodDatabase?searchTerm=${encodeURIComponent(searchTerm)}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Search response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Search results data:', data);
          setSearchResults(data);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch search results:', response.status, response.statusText, errorText);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching food database:', error);
        setSearchResults([]);
      }
    };

    // Add debounce to prevent too many API calls
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        console.log('Triggering search with term:', searchTerm);
        fetchSearchResults();
      } else {
        console.log('Empty search term, clearing results');
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Add useEffect to update today's date every day
  useEffect(() => {
    const updateToday = () => {
      const newToday = new Date().toISOString().split('T')[0];
      setToday(newToday);
    };

    // Update immediately
    updateToday();

    // Set up interval to check for date change
    const interval = setInterval(updateToday, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []); // Remove selectedDate dependency

  // Add useEffect to fetch nutrition data for selected date
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const response = await fetch(`/api/user/nutrition?date=${selectedDate}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch nutrition data');
        }
        const data = await response.json();
        
        // Update the daily calorie target if it's available
        if (data.dailyCalorieGoal) {
          setDailyCalorieTarget(data.dailyCalorieGoal);
        }
        
        // Initialize meal plan with empty arrays for each meal time
        const initialMealPlan = {
          Breakfast: [],
          'Morning Snack': [],
          Lunch: [],
          'Evening Snack': [],
          Dinner: []
        };
        
        // Update the meal plan with data from the server
        if (data.meals && typeof data.meals === 'object') {
          Object.keys(data.meals).forEach(mealTime => {
            if (Array.isArray(data.meals[mealTime])) {
              initialMealPlan[mealTime] = [...data.meals[mealTime]];
            }
          });
        }
        
        setMealPlan(initialMealPlan);
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
      }
    };
    
    fetchNutritionData();
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    console.log('Date changed to:', newDate);
    setSelectedDate(newDate);
  };

  // Handle today button click
  const handleTodayClick = () => {
    const currentToday = new Date().toISOString().split('T')[0];
    console.log('Setting date to today:', currentToday);
    setToday(currentToday);
    setSelectedDate(currentToday);
  };

  // Add function to reset daily data
  const resetDailyData = async () => {
    try {
      console.log('=== Reset Daily Data Debug ===');
      console.log('Resetting data for date:', selectedDate);
      
      const response = await fetch('/api/user/nutrition/resetDaily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ date: selectedDate }),
      });

      console.log('Reset API Response Status:', response.status);
      
      if (response.ok) {
        // Refresh the data
        const refreshResponse = await fetch(`/api/user/nutrition?date=${selectedDate}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Refresh API Response Status:', refreshResponse.status);
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          console.log('Refresh API Response Data:', data);
          
          const dateData = data.dailyTotals.find(day => day.date === selectedDate);
          console.log('Found data after reset:', dateData);
          
          const groupedMeals = {
            Breakfast: [],
            'Morning Snack': [],
            Lunch: [],
            'Evening Snack': [],
            Dinner: []
          };
          
          if (dateData) {
            dateData.meals.forEach(meal => {
              const mealTime = meal.mealTime || 'Lunch';
              if (groupedMeals[mealTime]) {
                groupedMeals[mealTime].push(meal);
              }
            });
          }
          
          setMealPlan(groupedMeals);
        } else {
          const errorText = await refreshResponse.text();
          console.error('Refresh API Error Response:', errorText);
        }
      } else {
        const errorText = await response.text();
        console.error('Reset API Error Response:', errorText);
      }
    } catch (error) {
      console.error('Error resetting daily data:', error);
    }
  };

  // Calculate calories remaining
  const caloriesRemaining = dailyCalorieTarget - totals.calories;
  const percentageConsumed = Math.min(100, (totals.calories / dailyCalorieTarget) * 100);

  // Modify addFoodToMeal to save to database
  const addFoodToMeal = async (food, mealTime) => {
    try {
      console.log('Adding food to meal:', { food, mealTime, selectedDate });
      
      // Ensure mealTime is valid
      if (!mealTimes.includes(mealTime)) {
        console.error('Invalid meal time:', mealTime);
        alert('Invalid meal time selected. Please try again.');
        return;
      }
      
      // Save to database
      const response = await fetch('/api/user/nutrition/addMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fat,
          mealTime: mealTime,
          date: selectedDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save meal');
      }

      const savedMeal = await response.json();
      console.log('Successfully saved meal:', savedMeal);
      
      // Update local state
      setMealPlan(prev => {
        // Ensure prev is an object and has the meal time
        if (!prev || typeof prev !== 'object') {
          prev = {
            Breakfast: [],
            'Morning Snack': [],
            Lunch: [],
            'Evening Snack': [],
            Dinner: []
          };
        }
        
        // Ensure the meal time exists in the meal plan
        if (!prev[mealTime]) {
          prev[mealTime] = [];
        }
        
        return {
          ...prev,
          [mealTime]: [...prev[mealTime], savedMeal]
        };
      });
      
      setSearchTerm('');
      setSearchResults([]);

      // Refresh the data to get updated totals
      const refreshResponse = await fetch(`/api/user/nutrition?date=${selectedDate}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        console.log('Refreshed nutrition data:', data);
        
        // Update meal plan with the latest data
        if (data.meals) {
          const updatedMealPlan = {
            Breakfast: [],
            'Morning Snack': [],
            Lunch: [],
            'Evening Snack': [],
            Dinner: []
          };
          
          // Handle the new structure where meals is an object
          Object.keys(data.meals).forEach(mealTime => {
            if (Array.isArray(data.meals[mealTime])) {
              updatedMealPlan[mealTime] = [...data.meals[mealTime]];
            }
          });
          
          setMealPlan(updatedMealPlan);
        }
        
        // Refresh progress data to update the progress page
        try {
          await fetch('/api/user/progress', {
            credentials: 'include'
          });
          console.log('Progress data refreshed after adding meal');
        } catch (error) {
          console.error('Error refreshing progress data:', error);
        }
      } else {
        throw new Error('Failed to refresh nutrition data');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      alert(`Failed to add meal: ${error.message}`);
    }
  };

  // Modify removeFood to delete from database
  const removeFood = async (mealTime, index) => {
    try {
      const mealToDelete = mealPlan[mealTime][index];
      console.log('Removing meal:', mealToDelete);
      
      // Ensure mealTime is valid
      if (!mealTimes.includes(mealTime)) {
        console.error('Invalid meal time:', mealTime);
        alert('Invalid meal time selected. Please try again.');
        return;
      }
      
      // Delete from database
      const response = await fetch('/api/user/nutrition/removeMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mealId: {
            name: mealToDelete.name,
            calories: mealToDelete.calories,
            mealTime: mealTime
          },
          date: selectedDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove meal');
      }

      // Update local state
      setMealPlan(prev => {
        const updatedMealPlan = { ...prev };
        if (Array.isArray(updatedMealPlan[mealTime])) {
          updatedMealPlan[mealTime] = updatedMealPlan[mealTime].filter((_, i) => i !== index);
        }
        return updatedMealPlan;
      });

      // Refresh the data to get updated totals
      const refreshResponse = await fetch(`/api/user/nutrition?date=${selectedDate}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        console.log('Refreshed nutrition data:', data);
        
        // Update meal plan with the latest data
        if (data.meals) {
          const updatedMealPlan = {
            Breakfast: [],
            'Morning Snack': [],
            Lunch: [],
            'Evening Snack': [],
            Dinner: []
          };
          
          // Handle the new structure where meals is an object
          Object.keys(data.meals).forEach(mealTime => {
            if (Array.isArray(data.meals[mealTime])) {
              updatedMealPlan[mealTime] = [...data.meals[mealTime]];
            }
          });
          
          setMealPlan(updatedMealPlan);
        }
        
        // Refresh progress data to update the progress page
        try {
          await fetch('/api/user/progress', {
            credentials: 'include'
          });
          console.log('Progress data refreshed after removing meal');
        } catch (error) {
          console.error('Error refreshing progress data:', error);
        }
      } else {
        throw new Error('Failed to refresh nutrition data');
      }
    } catch (error) {
      console.error('Error removing meal:', error);
      alert(error.message || 'Failed to remove meal. Please try again.');
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen font-sans">
      {/* Header and Navigation */}
      <header className="bg-gray-950 py-6 my-8 px-6 mx-6 pt-12 mt-12 shadow-xl">
        <h1 className="text-4xl font-bold text-center tracking-tight mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
            Nutrition Tracker
          </span>
        </h1>
        <p className="text-center mb-6 text-indigo-200 opacity-90">Track your meals, macros, and meet your goals</p>
        
        {/* Add date selector */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={today}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTodayClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetDailyData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reset Day
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-full p-1 flex shadow-lg">
            <button 
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'add' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-indigo-200 hover:text-white hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveTab('add')}
            >
              Add Food
            </button>
            <button 
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'summary' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-indigo-200 hover:text-white hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button 
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'plan' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-indigo-200 hover:text-white hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveTab('plan')}
            >
              Meal Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Daily Target Setting - Always visible */}
        <div className="mb-8 p-6 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">Daily Calorie Target</h2>
              <div className="flex items-center mt-3">
                <div className="w-28 p-2 bg-gray-800 text-white rounded-lg mr-3 border border-gray-700">
                  {dailyCalorieTarget}
                </div>
                <span className="text-gray-300"></span>
              </div>
            </div>
            
            <div className="mt-5 md:mt-0">
              <div className="text-right mb-2">
                {caloriesRemaining > 0 ? (
                  <span className="font-medium text-lg">{caloriesRemaining} calories remaining</span>
                ) : (
                  <span className="font-medium text-lg text-rose-400">{Math.abs(caloriesRemaining)} calories over</span>
                )}
              </div>
              <div className="w-full md:w-80 bg-gray-800 rounded-full h-4 shadow-inner overflow-hidden">
                <div 
                  className={`h-4 rounded-full transition-all ${
                    caloriesRemaining > 0 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${percentageConsumed}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-400 text-right">
                {totals.calories} / {dailyCalorieTarget} kcal
              </div>
            </div>
          </div>
        </div>

        {/* Add Food Tab */}
        {activeTab === 'add' && (
          <div className="mb-8 p-7 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="bg-indigo-900/50 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
              Add Food to Your Plan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Meal</label>
                <select 
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  value={currentMealTime}
                  onChange={(e) => setCurrentMealTime(e.target.value)}
                >
                  {mealTimes.map(meal => (
                    <option key={meal} value={meal}>{meal}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Food</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Search Results Dropdown */}
                {searchTerm && (
                  <div className="absolute z-50 mt-1 w-full bg-gray-800 rounded-lg max-h-60 overflow-y-auto border border-gray-700 shadow-2xl">
                    {searchResults && searchResults.length > 0 ? (
                      searchResults.map((food, index) => (
                        <div 
                          key={index} 
                          className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 transition-colors"
                          onClick={() => addFoodToMeal(food, currentMealTime)}
                        >
                          <div className="font-semibold">{food.name}</div>
                          <div className="text-sm text-gray-300 flex justify-between mt-1">
                            <span className="font-medium">{food.calories} kcal</span>
                            <span>
                              <span className="text-blue-400">C: {food.carbs || 0}g</span> | 
                              <span className="text-green-400"> P: {food.protein || 0}g</span> | 
                              <span className="text-yellow-400"> F: {food.fat || 0}g</span>
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-400 text-center">
                        No foods found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Nutrition Summary Tab */}
        {activeTab === 'summary' && (
          <div className="mb-8 p-7 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="bg-indigo-900/50 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              Nutrition Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <div className="grid grid-cols-2 gap-5">
                  <div className="p-5 bg-gray-800/80 rounded-xl border border-gray-700 text-center">
                    <h3 className="font-semibold text-gray-300">Total Calories</h3>
                    <p className="text-4xl font-bold mt-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">{totals.calories}</p>
                    <p className="text-sm text-gray-400 mt-1">kilocalories</p>
                  </div>
                  
                  <div className="p-5 bg-gray-800/80 rounded-xl border border-gray-700">
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-400 font-medium">Carbs</span>
                        <span>{totals.macros.carbs}g</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2 shadow-inner overflow-hidden">
                        <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${macroPercentages.carbs}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 font-medium">Protein</span>
                        <span>{totals.macros.protein}g</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2 shadow-inner overflow-hidden">
                        <div className="h-2.5 rounded-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: `${macroPercentages.protein}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-400 font-medium">Fat</span>
                        <span>{totals.macros.fat}g</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2 shadow-inner overflow-hidden">
                        <div className="h-2.5 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400" style={{ width: `${macroPercentages.fat}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 p-5 bg-gray-800/80 rounded-xl border border-gray-700 shadow-lg">
                  <h3 className="font-semibold mb-4 text-indigo-200">Calorie Balance</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span>Daily Target</span>
                    <span className="font-medium bg-gray-900/60 py-1 px-3 rounded-full">{dailyCalorieTarget} kcal</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span>Consumed Today</span>
                    <span className="font-medium bg-gray-900/60 py-1 px-3 rounded-full">{totals.calories} kcal</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                    <span>Remaining</span>
                    <span className={`font-medium py-1 px-3 rounded-full ${
                      caloriesRemaining > 0 
                        ? 'text-emerald-300 bg-emerald-900/30' 
                        : 'text-rose-300 bg-rose-900/30'
                    }`}>
                      {caloriesRemaining > 0 ? `+${caloriesRemaining}` : caloriesRemaining} kcal
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 p-5 bg-gray-800/80 rounded-xl border border-gray-700 shadow-lg">
                <h3 className="font-semibold mb-6 text-center text-indigo-200">Macronutrient Distribution</h3>
                
                {totals.calories > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 mr-3"></div>
                      <span className="text-sm w-24">Carbs: {macroPercentages.carbs}%</span>
                      <div className="flex-1 mx-4">
                        <div className="h-3 bg-gray-700 rounded-full shadow-inner overflow-hidden">
                          <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${macroPercentages.carbs}%` }}></div>
                        </div>
                      </div>
                      <span className="font-medium w-20 text-right">{Math.round(totals.macros.carbs * 4)} kcal</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-600 to-green-400 mr-3"></div>
                      <span className="text-sm w-24">Protein: {macroPercentages.protein}%</span>
                      <div className="flex-1 mx-4">
                        <div className="h-3 bg-gray-700 rounded-full shadow-inner overflow-hidden">
                          <div className="h-3 bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${macroPercentages.protein}%` }}></div>
                        </div>
                      </div>
                      <span className="font-medium w-20 text-right">{Math.round(totals.macros.protein * 4)} kcal</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 mr-3"></div>
                      <span className="text-sm w-24">Fat: {macroPercentages.fat}%</span>
                      <div className="flex-1 mx-4">
                        <div className="h-3 bg-gray-700 rounded-full shadow-inner overflow-hidden">
                          <div className="h-3 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full" style={{ width: `${macroPercentages.fat}%` }}></div>
                        </div>
                      </div>
                      <span className="font-medium w-20 text-right">{Math.round(totals.macros.fat * 9)} kcal</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p>No food added yet.</p>
                    <p className="mt-2 text-sm">Add food items to see macro breakdown</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
                
        {/* Meal Plan Tab */}
        {activeTab === 'plan' && (
          <div className="mb-8 p-7 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="bg-indigo-900/50 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              Your Meal Plan
            </h2>
            
            <div className="space-y-6">
              {mealTimes.map(mealTime => {
                // Safely calculate meal calories
                const mealCalories = Array.isArray(mealPlan[mealTime]) 
                  ? mealPlan[mealTime].reduce((sum, food) => sum + (food.calories || 0), 0)
                  : 0;
                
                return (
                  <div key={mealTime} className="p-5 bg-gray-800/80 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-lg font-semibold text-indigo-200">{mealTime}</h3>
                      {mealCalories > 0 && (
                        <span className="text-sm bg-indigo-900/40 py-1 px-3 rounded-full mt-2 md:mt-0">
                          {mealCalories} kcal
                        </span>
                      )}
                    </div>
                    
                    {(!mealPlan[mealTime] || mealPlan[mealTime].length === 0) ? (
                      <div className="text-center py-5 text-gray-400 border border-dashed border-gray-700 rounded-lg">
                        <p>No food added yet</p>
                        <button 
                          className="mt-3 px-4 py-2 text-sm bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/40 rounded-lg transition-colors"
                          onClick={() => {
                            setCurrentMealTime(mealTime);
                            setActiveTab('add');
                          }}
                        >
                          Add Food
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mealPlan[mealTime].map((food, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-900 rounded-lg border border-gray-800 group hover:border-indigo-500 transition-all shadow-md">
                            <div>
                              <div className="font-medium group-hover:text-indigo-300 transition-colors">{food.name || food.food}</div>
                              <div className="text-sm text-gray-400 mt-1">
                                <span className="text-blue-400">C: {food.carbs || 0}g</span> | 
                                <span className="text-green-400"> P: {food.protein || 0}g</span> | 
                                <span className="text-yellow-400"> F: {food.fat || 0}g</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium mr-4">{food.calories || 0} kcal</span>
                              <button 
                                className="text-gray-400 hover:text-rose-400 transition-colors"
                                onClick={() => removeFood(mealTime, index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <button 
                          className="w-full mt-3 py-2 text-indigo-300 hover:text-indigo-200 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors text-sm"
                          onClick={() => {
                            setCurrentMealTime(mealTime);
                            setActiveTab('add');
                          }}
                        >
                          + Add More Food
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Nutrition;