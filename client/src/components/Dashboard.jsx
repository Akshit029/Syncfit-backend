import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import axios from 'axios';

// Register the necessary chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

// Configure axios
axios.defaults.withCredentials = true; // Important for cookies/authentication
const API_URL = `${process.env.REACT_APP_API_URL}/api`; // Update with your backend URL

const Dashboard = () => {
  // User data state
  const [userData, setUserData] = useState({
    workoutsCompleted: 0,
    caloriesBurned: 0,
    weightLost: 0,
    weightData: [],
    milestones: []
  });

  // All weight entries - store full history
  const [allWeightEntries, setAllWeightEntries] = useState([]);

  // Chart instance reference
  const chartInstanceRef = useRef(null);

  // Time view options
  const [timeView, setTimeView] = useState('monthly'); // 'weekly' or 'monthly'
  
  // Mobile navigation state
  const [activeSection, setActiveSection] = useState('overview');
  
  // Refs for scrolling
  const overviewRef = useRef(null);
  const chartRef = useRef(null);
  const milestonesRef = useRef(null);
  const formsRef = useRef(null);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form state for adding new data
  const [formData, setFormData] = useState({
    workouts: '',
    calories: '',
    weightDate: new Date().toISOString().split('T')[0], // Today's date
    weight: '',
    milestoneName: ''
  });

  // Generate monthly labels for the past 6 months
  const generateMonthLabels = useCallback(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      months.push(`${monthName} ${year}`);
    }
    
    return months;
  }, []);

  // Generate weekly labels (past 6 weeks)
  const generateWeekLabels = useCallback(() => {
    const weeks = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - (i * 7));
      weeks.push(`W${6-i}: ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`);
    }
    
    return weeks;
  }, []);

  // Mobile detection for chart options
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };
    
    // Check initially
    checkMobile();
    
    // Set up listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('userData');
        if (!storedUser) {
          setIsAuthenticated(false);
          setError('Please log in to access your dashboard');
          return;
        }

        // Verify token is still valid
        const response = await axios.get(`${API_URL}/auth/user`, {
          withCredentials: true
        });

        if (response.data.user) {
          setIsAuthenticated(true);
          setError(null);
        } else {
          setIsAuthenticated(false);
          setError('Please log in to access your dashboard');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
        setError('Please log in to access your dashboard');
      }
    };

    checkAuth();
  }, []);

  // Only fetch data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, timeView, fetchUserData]);

  // Fetch user data from MongoDB - Moved to a useCallback to use in dependencies
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fitness?timeView=${timeView}`);
      
      // If no data returned yet, initialize with our time labels
      if (!response.data.weightData || response.data.weightData.length === 0) {
        const labels = timeView === 'monthly' ? generateMonthLabels() : generateWeekLabels();
        response.data.weightData = labels.map(label => ({ 
          timeLabel: label, 
          weight: null 
        }));
      }
      
      setUserData(response.data);
      
      // Also store all weight entries for the full history graph
      if (response.data.allWeightEntries) {
        setAllWeightEntries(response.data.allWeightEntries);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching fitness data:', err);
      setError('Failed to load your fitness data. Please try again later.');
      
      // Initialize with empty data structure - use null instead of 0
      const labels = timeView === 'monthly' ? generateMonthLabels() : generateWeekLabels();
      setUserData(prev => ({
        ...prev,
        weightData: labels.map(label => ({ 
          timeLabel: label, 
          weight: null 
        }))
      }));
    } finally {
      setLoading(false);
    }
  }, [timeView, generateMonthLabels, generateWeekLabels]);

  // Initialize weight data based on time view
  useEffect(() => {
    const labels = timeView === 'monthly' ? generateMonthLabels() : generateWeekLabels();
    
    // If no data exists yet, initialize with nulls instead of zeros
    if (!userData.weightData || userData.weightData.length === 0) {
      setUserData(prev => ({
        ...prev,
        weightData: labels.map(label => ({ 
          timeLabel: label, 
          weight: null 
        }))
      }));
    } else if (userData.weightData.length !== labels.length) {
      // If we're switching views or initializing, adapt the data
      const newWeightData = labels.map(label => {
        const existingEntry = userData.weightData.find(item => item.timeLabel === label);
        return existingEntry || { timeLabel: label, weight: null };
      });
      
      setUserData(prev => ({
        ...prev,
        weightData: newWeightData
      }));
    }
  }, [timeView, userData.weightData, generateMonthLabels, generateWeekLabels]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Scroll to section
  const scrollToSection = (section) => {
    setActiveSection(section);
    
    if (section === 'overview' && overviewRef.current) {
      overviewRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'chart' && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'milestones' && milestonesRef.current) {
      milestonesRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'forms' && formsRef.current) {
      formsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update workouts and calories
  const updateActivity = async (e) => {
    e.preventDefault();
    
    try {
      if (!isAuthenticated) {
        setError('Please log in to update activity');
        return;
      }

      const workoutsToAdd = parseInt(formData.workouts) || 0;
      const caloriesToAdd = parseInt(formData.calories) || 0;
      
      if (workoutsToAdd === 0 && caloriesToAdd === 0) {
        setError('Please enter at least one value to update');
        return;
      }
      
      const response = await axios.post(`${API_URL}/fitness/activity`, {
        workouts: workoutsToAdd,
        calories: caloriesToAdd
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setUserData(response.data);
        setFormData({
          ...formData,
          workouts: '',
          calories: ''
        });
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      console.error('Error updating activity:', err);
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setError('Please log in again to update activity');
      } else {
        setError(err.response?.data?.message || 'Failed to update activity. Please try again.');
      }
    }
  };

  // Update weight using date selection - modified to maintain history
  const updateWeight = async (e) => {
    e.preventDefault();
    
    try {
      const newWeight = parseFloat(formData.weight);
      const weightDate = formData.weightDate;
      
      if (isNaN(newWeight) || !weightDate) {
        setError('Please provide both a valid weight and date');
        return;
      }
      
      // Add new weight entry to our local state directly (optimistic update)
      const newEntry = {
        date: weightDate,
        weight: newWeight,
        id: Date.now().toString() // Temporary ID until server responds
      };
      
      // Create a new array with all existing entries plus the new one
      const updatedEntries = [...allWeightEntries, newEntry];
      setAllWeightEntries(updatedEntries);
      
      // Sort by date
      updatedEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Call API to update server data
      const response = await axios.post(`${API_URL}/fitness/weight`, {
        date: weightDate,
        weight: newWeight,
        timeView: timeView
      });
      
      // Update userData with server response
      setUserData(response.data);
      
      // Update all entries if the response includes them
      if (response.data.allWeightEntries) {
        setAllWeightEntries(response.data.allWeightEntries);
      }
      
      // Only clear the weight, keep the date for convenience
      setFormData({
        ...formData,
        weight: ''
      });
      
      // Force refresh the chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.update();
      }
    } catch (err) {
      console.error('Error updating weight:', err);
      setError('Failed to update weight. Please try again.');
    }
  };

  // Add a new milestone
  const addMilestone = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.milestoneName.trim() === '') return;
      
      const response = await axios.post(`${API_URL}/fitness/milestone`, {
        milestoneName: formData.milestoneName
      });
      
      setUserData(response.data);
      
      setFormData({
        ...formData,
        milestoneName: ''
      });
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError('Failed to add milestone. Please try again.');
    }
  };

  // Remove a milestone
  const removeMilestone = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/fitness/milestone/${id}`);
      setUserData(response.data);
    } catch (err) {
      console.error('Error removing milestone:', err);
      setError('Failed to remove milestone. Please try again.');
    }
  };

  // Reset all data
  const resetData = async () => {
    if (window.confirm('Are you sure you want to reset all your fitness data?')) {
      try {
        const response = await axios.post(`${API_URL}/fitness/reset`);
        setUserData(response.data);
        setAllWeightEntries([]);
      } catch (err) {
        console.error('Error resetting data:', err);
        setError('Failed to reset data. Please try again.');
      }
    }
  };

  // Prepare chart data - MODIFIED to use all weight entries
  const prepareChartData = () => {
    // If we have allWeightEntries with dates, sort and use them
    if (allWeightEntries && allWeightEntries.length > 0) {
      // Sort entries by date
      const sortedEntries = [...allWeightEntries].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      return {
        labels: sortedEntries.map(entry => {
          const date = new Date(entry.date);
          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
        }),
        datasets: [
          {
            label: 'Weight (kg)',
            data: sortedEntries.map(entry => entry.weight),
            fill: false,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
          },
        ],
      };
    }
    
    // Fallback to original timeView-based data
    return {
      labels: userData.weightData?.map(data => data.timeLabel) || [],
      datasets: [
        {
          label: 'Weight (kg)',
          data: userData.weightData?.map(data => data.weight !== null ? data.weight : null) || [],
          fill: false,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  // Dynamic chart options based on mobile state
  const chartOptions = { 
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      y: { 
        beginAtZero: false,
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: isMobile ? 8 : 10
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          maxRotation: isMobile ? 60 : 45,
          minRotation: isMobile ? 60 : 45,
          font: {
            size: isMobile ? 8 : 10
          },
          callback: function(val, index) {
            if (window.innerWidth < 400) {
              return index % 2 === 0 ? this.getLabelForValue(val) : '';
            }
            return this.getLabelForValue(val);
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      tooltip: {
        enabled: true,
        titleFont: {
          size: isMobile ? 10 : 12
        },
        bodyFont: {
          size: isMobile ? 10 : 12
        },
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 10,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `Weight: ${context.raw} kg`;
          }
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  // Force chart update when timeView, userData or allWeightEntries changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.update();
    }
  }, [timeView, userData.weightData, allWeightEntries, isMobile]);

  // Remove a workout
  // eslint-disable-next-line no-unused-vars
  const removeWorkout = async (date) => {
    try {
      const response = await axios.delete(`${API_URL}/fitness/workout/${date}`);
      setUserData(response.data);
    } catch (err) {
      console.error('Error removing workout:', err);
      setError('Failed to remove workout. Please try again.');
    }
  };

  // Remove an exercise from a workout
  // eslint-disable-next-line no-unused-vars
  const removeExercise = async (date, exerciseIndex) => {
    try {
      const response = await axios.post(`${API_URL}/fitness/remove-history-exercise`, {
        date,
        exerciseIndex
      });
      
      if (response.data) {
        setUserData(prevData => ({
          ...prevData,
          caloriesBurned: response.data.caloriesBurned || prevData.caloriesBurned
        }));
      }
    } catch (error) {
      console.error('Error removing exercise:', error);
      setError('Failed to remove exercise. Please try again.');
    }
  };

  // Remove a weight entry
  const removeWeightEntry = async (date) => {
    try {
      const response = await axios.delete(`${API_URL}/fitness/weight/${date}`);
      setUserData(response.data);
      if (response.data.allWeightEntries) {
        setAllWeightEntries(response.data.allWeightEntries);
      }
      // Force refresh the chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.update();
      }
    } catch (err) {
      console.error('Error removing weight entry:', err);
      setError('Failed to remove weight entry. Please try again.');
    }
  };

  // Calculate total calories
  const totalCalories = userData.caloriesBurned || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-semibold">Loading your fitness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white mt-12 pt-12 min-h-screen">
      {/* Fixed Mobile Navigation Bar */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 z-10 border-t border-gray-800 shadow-lg">
        <div className="flex justify-around">
          <button 
            onClick={() => scrollToSection('overview')}
            className={`flex-1 py-3 text-xs flex flex-col items-center ${activeSection === 'overview' ? 'text-blue-400' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Overview
          </button>
          <button 
            onClick={() => scrollToSection('chart')}
            className={`flex-1 py-3 text-xs flex flex-col items-center ${activeSection === 'chart' ? 'text-blue-400' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Chart
          </button>
          <button 
            onClick={() => scrollToSection('milestones')}
            className={`flex-1 py-3 text-xs flex flex-col items-center ${activeSection === 'milestones' ? 'text-blue-400' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Milestones
          </button>
          <button 
            onClick={() => scrollToSection('forms')}
            className={`flex-1 py-3 text-xs flex flex-col items-center ${activeSection === 'forms' ? 'text-blue-400' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Data
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {error && (
          <div className="bg-red-500 bg-opacity-90 backdrop-blur-sm text-white p-4 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm md:text-base">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 bg-opacity-20 backdrop-blur-sm p-2 rounded-full inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Fitness Dashboard</h1>
          </div>
        </div>
        
        {/* Fitness Journey Overview */}
        <div ref={overviewRef} className="p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-xl mb-6 border border-gray-700 transform transition-all hover:scale-[1.01]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Your Progress
              </h2>
              <p className="mt-2 text-gray-300 text-sm">Track your fitness journey and celebrate your achievements!</p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-900 rounded-xl text-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600 opacity-20 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="w-8 h-8 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-xs text-blue-100 font-medium mb-1">Workouts</p>
                    <p className="text-2xl font-bold">{userData.workoutsCompleted}</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-600 to-red-900 rounded-xl text-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-600 opacity-20 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="w-8 h-8 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                      </svg>
                    </div>
                    <p className="text-xs text-red-100 font-medium mb-1">Calories</p>
                    <p className="text-2xl font-bold">{totalCalories}</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-600 to-green-900 rounded-xl text-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-600 opacity-20 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="w-8 h-8 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-xs text-green-100 font-medium mb-1">Weight Lost</p>
                    <p className="text-2xl font-bold">{userData.weightLost} kg</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Links - Hide on mobile (we have bottom nav instead) */}
            <div className="hidden md:flex md:flex-col md:space-y-4 md:justify-center">
              <button 
                onClick={() => document.getElementById('workouts-form').scrollIntoView({ behavior: 'smooth' })} 
                className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all flex items-center justify-between"
              >
                <span className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Log Workout Activity
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button 
                onClick={() => document.getElementById('weight-form').scrollIntoView({ behavior: 'smooth' })} 
                className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg hover:from-purple-500 hover:to-purple-600 transition-all flex items-center justify-between"
              >
                <span className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  Log Weight
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button 
                onClick={() => document.getElementById('milestone-form').scrollIntoView({ behavior: 'smooth' })} 
                className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:from-green-500 hover:to-green-600 transition-all flex items-center justify-between"
              >
                <span className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Add Milestone
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Chart */}
        <div ref={chartRef} className="p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-xl mb-6 border border-gray-700 transform transition-all hover:scale-[1.01]">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Weight Progress
              </h2>
              <p className="text-sm text-gray-300 mt-1">Track your weight loss journey over time</p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button 
                onClick={() => setTimeView('weekly')} 
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${timeView === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setTimeView('monthly')} 
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${timeView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Monthly
              </button>
              <button 
                onClick={fetchUserData} 
                className="px-3 py-2 text-sm rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-70 p-4 rounded-xl border border-gray-700 mb-4">
            <div className="h-64 md:h-80">
              <Line 
                data={chartData} 
                options={chartOptions} 
                ref={chartInstanceRef} 
              />
            </div>
          </div>
        </div>
        
        {/* Weight History Table */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Weight History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Weight (kg)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {allWeightEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {entry.weight}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => removeWeightEntry(entry.date)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Milestones */}
        <div ref={milestonesRef} className="p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-xl mb-6 border border-gray-700 transform transition-all hover:scale-[1.01]">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Milestones & Achievements
          </h2>
          
          <div className="space-y-4">
            {userData.milestones && userData.milestones.length > 0 ? (
              userData.milestones.map((milestone) => (
                <div 
                  key={milestone._id} 
                  className="bg-gray-700 bg-opacity-50 p-4 rounded-lg border border-gray-600 flex justify-between items-center group hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(milestone.date).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMilestone(milestone._id)} 
                    className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400">You haven't added any milestones yet!</p>
                <p className="text-sm text-gray-500 mt-1">Add your fitness achievements to track progress.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Data Entry Forms */}
        <div ref={formsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Workout and Calories Form */}
          <div id="workouts-form" className="p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 transform transition-all hover:scale-[1.01]">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Log Activity
            </h2>
            
            <form onSubmit={updateActivity} className="space-y-4">
              <div>
                <label htmlFor="workouts" className="block text-sm font-medium text-gray-300 mb-1">
                  Workouts Completed
                </label>
                <input 
                  type="number"
                  id="workouts"
                  name="workouts"
                  value={formData.workouts}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of workouts"
                />
              </div>
              
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-300 mb-1">
                  Calories Burned
                </label>
                <input 
                  type="number"
                  id="calories"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter calories burned"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Log Activity
              </button>
            </form>
          </div>
          
          {/* Weight Form */}
          <div id="weight-form" className="p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 transform transition-all hover:scale-[1.01]">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Log Weight
            </h2>
            
            <form onSubmit={updateWeight} className="space-y-4">
              <div>
                <label htmlFor="weightDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Date
                </label>
                <input 
                  type="date"
                  id="weightDate"
                  name="weightDate"
                  value={formData.weightDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <input 
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your weight"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Log Weight
              </button>
            </form>
          </div>
          
          {/* Milestone Form */}
          <div id="milestone-form" className="p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 transform transition-all hover:scale-[1.01] md:col-span-2">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Add Milestone
            </h2>
            
            <form onSubmit={addMilestone} className="space-y-4">
              <div>
                <label htmlFor="milestoneName" className="block text-sm font-medium text-gray-300 mb-1">
                  Milestone Description
                </label>
                <input 
                  type="text"
                  id="milestoneName"
                  name="milestoneName"
                  value={formData.milestoneName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., First 5K run, Lost 5kg, etc."
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Milestone
                </button>
                
                <button
                  type="button"
                  onClick={resetData}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Reset All Data
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;