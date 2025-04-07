// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Workouts = () => {
//   // State for workout data
//   const [workoutPlan, setWorkoutPlan] = useState([]);
//   const [activeDay, setActiveDay] = useState(null);
//   const [newExercise, setNewExercise] = useState({
//     name: '',
//     duration: '',
//     calories: '',
//     focus: 'Upper Body'
//   });
//   const [showAddExercise, setShowAddExercise] = useState(false);
//   const [todayWorkout, setTodayWorkout] = useState({
//     exercises: [],
//     totalCalories: 0,
//     totalDuration: 0
//   });
  
//   // Focus options for exercises
//   const focusOptions = ['Upper Body', 'Lower Body', 'Cardio', 'Core', 'Full Body', 'Flexibility'];
  
//   // Today's date to highlight current day
//   const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
//   // Fetch workout data on component mount
//   useEffect(() => {
//     fetchWorkoutData();
//   }, []);
  
//   // Function to fetch workout data from the server
//   const fetchWorkoutData = async () => {
//     try {
//       // Fetch workout plan
//       const planResponse = await axios.get('http://localhost:5001/api/fitness/workout-plan', { withCredentials: true });
//       if (planResponse.data) {
//         setWorkoutPlan(planResponse.data);
//       }
      
//       // Fetch today's workout
//       const todayResponse = await axios.get('http://localhost:5001/api/fitness/today-workout', { withCredentials: true });
//       if (todayResponse.data) {
//         setTodayWorkout(todayResponse.data);
//       }
//     } catch (error) {
//       console.error('Error fetching workout data:', error);
//     }
//   };
  
//   // Function to handle input changes for new exercise
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewExercise({
//       ...newExercise,
//       [name]: value
//     });
//   };
  
//   // Function to add a new exercise
//   const addExercise = async () => {
//     try {
//       if (!newExercise.name || !newExercise.duration || !newExercise.calories) {
//         alert('Please fill in all fields');
//         return;
//       }
      
//       const response = await axios.post('http://localhost:5001/api/fitness/add-exercise', {
//         ...newExercise,
//         calories: parseFloat(newExercise.calories),
//         duration: parseFloat(newExercise.duration)
//       }, { withCredentials: true });
      
//       if (response.data) {
//         // Update today's workout
//         setTodayWorkout(response.data);
        
//         // Reset form
//         setNewExercise({
//           name: '',
//           duration: '',
//           calories: '',
//           focus: 'Upper Body'
//         });
        
//         // Hide form
//         setShowAddExercise(false);
//       }
//     } catch (error) {
//       console.error('Error adding exercise:', error);
//       alert('Failed to add exercise. Please try again.');
//     }
//   };
  
//   // Function to complete today's workout
//   const completeWorkout = async () => {
//     try {
//       if (todayWorkout.exercises.length === 0) {
//         alert('No exercises to complete');
//         return;
//       }
      
//       const response = await axios.post('http://localhost:5001/api/fitness/complete-workout', {
//         exercises: todayWorkout.exercises,
//         totalCalories: todayWorkout.totalCalories,
//         totalDuration: todayWorkout.totalDuration
//       }, { withCredentials: true });
      
//       if (response.data) {
//         // Update workout plan with the returned workouts
//         if (response.data.workouts) {
//           setWorkoutPlan(response.data.workouts);
//         }
        
//         // Reset today's workout
//         setTodayWorkout({
//           exercises: [],
//           totalCalories: 0,
//           totalDuration: 0
//         });
        
//         alert('Workout completed successfully!');
//       }
//     } catch (error) {
//       console.error('Error completing workout:', error);
//       alert('Failed to complete workout. Please try again.');
//     }
//   };
  
//   // Function to remove an exercise
//   const removeExercise = async (index) => {
//     try {
//       const response = await axios.post('http://localhost:5001/api/fitness/remove-exercise', { index }, { withCredentials: true });
      
//       if (response.data) {
//         setTodayWorkout(response.data);
//       }
//     } catch (error) {
//       console.error('Error removing exercise:', error);
//       alert('Failed to remove exercise. Please try again.');
//     }
//   };

//   return (
//     <div className="bg-gray-950 pt-12 mt-12 text-gray-100 min-h-screen">
//       {/* Header with blurred effect */}
//       <div className="bg-gray-950 relative overflow-hidden">
//         <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>
//         <div className="container mx-auto px-4 py-8 relative z-10">
//           <h1 className="text-4xl font-extrabold flex justify-center items-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
//             FitTrack
//           </h1>
//           <p className="text-gray-300 flex justify-center items-center mt-2">Your personalized fitness journey</p>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-6">
//         {/* Today's Workout Section */}
//         <div className="mb-8 rounded-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-6 py-4 flex justify-between items-center">
//             <h2 className="text-2xl font-bold text-white">Today's Workout</h2>
//             <div className="flex space-x-2">
//               <button 
//                 onClick={() => setShowAddExercise(!showAddExercise)}
//                 className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition duration-200"
//               >
//                 {showAddExercise ? 'Cancel' : 'Add Exercise'}
//               </button>
//               <button 
//                 onClick={completeWorkout}
//                 className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition duration-200"
//                 disabled={todayWorkout.exercises.length === 0}
//               >
//                 Complete Workout
//               </button>
//             </div>
//           </div>
          
//           {/* Add Exercise Form */}
//           {showAddExercise && (
//             <div className="bg-gray-900 p-6 border-b border-gray-800">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Exercise Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={newExercise.name}
//                     onChange={handleInputChange}
//                     className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     placeholder="e.g., Push-ups, Running, etc."
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Focus Area</label>
//                   <select
//                     name="focus"
//                     value={newExercise.focus}
//                     onChange={handleInputChange}
//                     className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   >
//                     {focusOptions.map((option) => (
//                       <option key={option} value={option}>{option}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Duration (minutes)</label>
//                   <input
//                     type="number"
//                     name="duration"
//                     value={newExercise.duration}
//                     onChange={handleInputChange}
//                     className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     placeholder="e.g., 30"
//                     min="1"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-400 mb-1">Calories Burned</label>
//                   <input
//                     type="number"
//                     name="calories"
//                     value={newExercise.calories}
//                     onChange={handleInputChange}
//                     className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     placeholder="e.g., 300"
//                     min="0"
//                   />
//                 </div>
//               </div>
//               <div className="mt-4 flex justify-end">
//                 <button
//                   onClick={addExercise}
//                   className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition duration-200"
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>
//           )}
          
//           {/* Today's Exercises */}
//           <div className="bg-gray-900 p-6">
//             {todayWorkout.exercises.length > 0 ? (
//               <div className="space-y-4">
//                 {todayWorkout.exercises.map((exercise, idx) => (
//                   <div 
//                     key={idx} 
//                     className="rounded-lg transition-all duration-300 transform border border-gray-700 bg-gray-800 hover:translate-x-1"
//                   >
//                     <div className="p-4">
//                       <div className="flex justify-between items-center">
//                         <h3 className="text-xl font-medium flex items-center">
//                           {exercise.name}
//                         </h3>
//                         <button 
//                           onClick={() => removeExercise(idx)}
//                           className="text-red-400 hover:text-red-300"
//                         >
//                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                       </div>
                      
//                       <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
//                         <div className="flex items-start">
//                           <span className="text-indigo-400 mr-2">⊳</span>
//                           <div>
//                             <p className="text-xs uppercase text-gray-500 font-medium">Focus</p>
//                             <p className="text-gray-300">{exercise.focus}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           <span className="text-indigo-400 mr-2">⊳</span>
//                           <div>
//                             <p className="text-xs uppercase text-gray-500 font-medium">Duration</p>
//                             <p className="text-gray-300">{exercise.duration} minutes</p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           <span className="text-indigo-400 mr-2">⊳</span>
//                           <div>
//                             <p className="text-xs uppercase text-gray-500 font-medium">Calories</p>
//                             <p className="text-gray-300">{exercise.calories} kcal</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
                
//                 {/* Workout Summary */}
//                 <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-lg font-medium">Workout Summary</h3>
//                     <span className="text-indigo-400">{new Date().toLocaleDateString()}</span>
//                   </div>
//                   <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-gray-400">Total Duration</p>
//                       <p className="text-xl font-bold">{todayWorkout.totalDuration} minutes</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-400">Total Calories Burned</p>
//                       <p className="text-xl font-bold">{todayWorkout.totalCalories} kcal</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-gray-400">No exercises added yet. Click "Add Exercise" to start your workout.</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Weekly Progress Summary */}
//           <div className="lg:col-span-2">
//             {/* Weekly Calendar View */}
//             <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl mb-6">
//               <div className="bg-gray-800 px-6 py-4">
//                 <h2 className="text-xl font-bold text-white flex items-center">
//                   <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
//                   </svg>
//                   Weekly Schedule
//                 </h2>
//               </div>
              
//               <div className="p-4">
//                 <div className="grid grid-cols-7 gap-2">
//                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
//                     const dayName = day === 'Mon' ? 'Monday' : 
//                                   day === 'Tue' ? 'Tuesday' : 
//                                   day === 'Wed' ? 'Wednesday' : 
//                                   day === 'Thu' ? 'Thursday' : 
//                                   day === 'Fri' ? 'Friday' : 
//                                   day === 'Sat' ? 'Saturday' : 'Sunday';
//                     const isToday = dayName === today;
                    
//                     return (
//                       <div key={idx} className="text-center">
//                         <div className={`text-xs font-medium uppercase mb-1 ${isToday ? 'text-indigo-400' : 'text-gray-500'}`}>
//                           {day}
//                         </div>
//                         <div 
//                           className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all ${
//                             isToday 
//                               ? 'bg-indigo-900 ring-2 ring-indigo-500 shadow-lg shadow-indigo-900/20' 
//                               : 'bg-gray-800 hover:bg-gray-750'
//                           }`}
//                         >
//                           <div className="text-lg font-bold">{idx + 1}</div>
//                           <div className="text-xs mt-1 px-1">Add</div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Workout Plan */}
//             <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
//               <div className="bg-gray-800 px-6 py-4">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-xl font-bold text-white flex items-center">
//                     <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
//                     </svg>
//                     Your Workouts
//                   </h2>
//                   <button 
//                     onClick={() => setShowAddExercise(true)}
//                     className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
//                   >
//                     Add Exercise
//                   </button>
//                 </div>
//               </div>
              
//               <div className="p-4">
//                 {workoutPlan.length > 0 ? (
//                   <div className="space-y-4">
//                     {workoutPlan.map((workout, index) => (
//                       <div key={index} className="bg-gray-800 rounded-lg p-4">
//                         <div className="flex justify-between items-center mb-2">
//                           <h3 className="text-lg font-medium text-white">
//                             {new Date(workout.date).toLocaleDateString()}
//                           </h3>
//                           <div className="text-sm text-gray-400">
//                             <span className="mr-4">{workout.totalDuration} min</span>
//                             <span>{workout.totalCalories} kcal</span>
//                           </div>
//                         </div>
//                         <div className="space-y-2">
//                           {workout.exercises.map((exercise, exIndex) => (
//                             <div key={exIndex} className="flex items-center justify-between bg-gray-700 rounded p-2">
//                               <div>
//                                 <span className="text-white">{exercise.name}</span>
//                                 <span className="text-gray-400 text-sm ml-2">({exercise.focus})</span>
//                               </div>
//                               <div className="text-sm text-gray-400">
//                                 <span className="mr-4">{exercise.duration} min</span>
//                                 <span>{exercise.calories} kcal</span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-400 text-center py-4">
//                     No workouts yet. Add exercises to start building your workout plan.
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="space-y-6">
//             {/* Stats Summary */}
//             <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
//               <div className="bg-gray-800 px-6 py-4">
//                 <h2 className="text-xl font-bold text-white flex items-center">
//                   <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
//                   </svg>
//                   Monthly Stats
//                 </h2>
//               </div>
              
//               <div className="p-6 grid grid-cols-1 gap-4">
//                 <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
//                   <div className="flex items-center">
//                     <div className="w-12 h-12 rounded-full bg-indigo-900 bg-opacity-50 flex items-center justify-center">
//                       <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <h3 className="text-sm font-medium text-gray-400">Workouts This Month</h3>
//                       <p className="text-2xl font-bold">
//                         {workoutPlan.filter(workout => {
//                           const workoutDate = new Date(workout.date);
//                           const now = new Date();
//                           return workoutDate.getMonth() === now.getMonth() && 
//                                  workoutDate.getFullYear() === now.getFullYear();
//                         }).length}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
//                   <div className="flex items-center">
//                     <div className="w-12 h-12 rounded-full bg-green-900 bg-opacity-50 flex items-center justify-center">
//                       <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <h3 className="text-sm font-medium text-gray-400">Total Calories</h3>
//                       <p className="text-2xl font-bold">
//                         {workoutPlan
//                           .filter(workout => {
//                             const workoutDate = new Date(workout.date);
//                             const now = new Date();
//                             return workoutDate.getMonth() === now.getMonth() && 
//                                    workoutDate.getFullYear() === now.getFullYear();
//                           })
//                           .reduce((total, workout) => total + workout.totalCalories, 0)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Motivational Quote */}
//             <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl overflow-hidden shadow-xl p-6">
//               <div className="flex justify-center items-center">
//                 <svg className="w-8 h-8 text-indigo-300 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                   <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
//                 </svg>
//                 <p className="italic text-lg text-gray-200">
//                   "The only bad workout is the one that didn't happen."
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Footer */}
//       <div className="bg-gray-950 py-6 mt-12 border-t border-gray-800">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="text-gray-500 text-sm">
//               © 2025 FitTrack. All rights reserved.
//             </div>
//             <div className="mt-4 md:mt-0">
//               <div className="flex space-x-4">
//                 <button className="text-gray-400 hover:text-indigo-400 transition-colors">
//                   <span className="sr-only">Privacy</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//                 <button className="text-gray-400 hover:text-indigo-400 transition-colors">
//                   <span className="sr-only">Support</span>
//                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
//                     <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Workouts;