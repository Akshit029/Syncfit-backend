// import React, { useState, useEffect } from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// const Progress = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [progressData, setProgressData] = useState({
//     weightHistory: [],
//     calorieHistory: [],
//     goalProgress: 0,
//     goalProgressChange: 0
//   });

//   // Fetch progress data from the database
//   useEffect(() => {
//     const fetchProgressData = async () => {
//       try {
//         const response = await fetch('/api/user/progress', {
//           credentials: 'include',
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log('Received progress data:', data);
        
//         // Transform the data to ensure all values are valid
//         const transformedData = {
//           weightHistory: Array.isArray(data.weightHistory) 
//             ? data.weightHistory
//                 .filter(entry => entry && entry.date && !isNaN(parseFloat(entry.weight)))
//                 .map(entry => ({
//                   date: new Date(entry.date).toISOString(),
//                   weight: parseFloat(entry.weight),
//                   weightChange: parseFloat(entry.weightChange) || 0
//                 }))
//                 .sort((a, b) => new Date(a.date) - new Date(b.date))
//             : [],
//           calorieHistory: Array.isArray(data.calorieHistory)
//             ? data.calorieHistory
//                 .filter(entry => entry && entry.date && !isNaN(parseFloat(entry.calories)))
//                 .map(entry => ({
//                   date: new Date(entry.date).toISOString(),
//                   calories: parseFloat(entry.calories)
//                 }))
//                 .sort((a, b) => new Date(a.date) - new Date(b.date))
//             : [],
//           goalProgress: parseFloat(data.goalProgress) || 0,
//           goalProgressChange: parseFloat(data.goalProgressChange) || 0
//         };
        
//         console.log('Transformed progress data:', transformedData);
//         setProgressData(transformedData);
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching progress data:', error);
//         // Set default empty data structure on error
//         setProgressData({
//           weightHistory: [],
//           calorieHistory: [],
//           goalProgress: 0,
//           goalProgressChange: 0
//         });
//         setIsLoading(false);
//       }
//     };

//     fetchProgressData();
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-950 mt-12 px-4 md:px-12 text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4">Loading progress data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-950 mt-12 px-4 md:px-12 text-white">
//       <div className="container mx-auto py-8">
//         <div className="flex items-center justify-center mb-8">
//           <div className="bg-blue-600 bg-opacity-20 backdrop-blur-sm p-2 rounded-full inline-flex items-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//             <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Progress</h1>
//           </div>
//         </div>
        
//         {/* Goal Progress */}
//         <div className="mb-8">
//           <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-800">
//               <h3 className="font-semibold text-white">Goal Progress</h3>
//             </div>
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <p className="text-gray-400 text-sm">Overall Progress</p>
//                   <p className="text-white text-2xl font-bold">{progressData.goalProgress}%</p>
//                 </div>
//                 <div className="p-2 rounded-full bg-blue-500 bg-opacity-30">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                   </svg>
//                 </div>
//               </div>
//               <div className="w-full bg-gray-700 rounded-full h-2.5">
//                 <div 
//                   className="bg-blue-500 h-2.5 rounded-full" 
//                   style={{ width: `${progressData.goalProgress}%` }}
//                 ></div>
//               </div>
//               <p className={`text-sm mt-2 ${progressData.goalProgressChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
//                 {progressData.goalProgressChange > 0 ? '↑' : '↓'} {Math.abs(progressData.goalProgressChange)}% change
//               </p>
//             </div>
//           </div>
//         </div>
        
//         {/* Weight History Graph */}
//         <div className="mb-8">
//           <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-800">
//               <h3 className="font-semibold text-white">Weight Trend (kg)</h3>
//             </div>
//             <div className="p-6">
//               {progressData.weightHistory && progressData.weightHistory.length > 0 ? (
//                 <div className="h-64">
//                   <Line 
//                     data={{
//                       labels: progressData.weightHistory.map(entry => {
//                         try {
//                           const date = new Date(entry.date);
//                           return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//                         } catch (error) {
//                           console.error('Error formatting date:', error);
//                           return 'Invalid Date';
//                         }
//                       }),
//                       datasets: [{
//                         label: 'Weight (kg)',
//                         data: progressData.weightHistory.map(entry => {
//                           const weight = parseFloat(entry.weight);
//                           return isNaN(weight) ? null : weight;
//                         }),
//                         fill: true,
//                         borderColor: 'rgb(99, 102, 241)',
//                         backgroundColor: 'rgba(99, 102, 241, 0.1)',
//                         tension: 0.4,
//                         pointBackgroundColor: 'rgb(99, 102, 241)',
//                         pointBorderColor: '#fff',
//                         pointBorderWidth: 2,
//                         pointHoverBackgroundColor: '#fff',
//                         pointHoverBorderColor: 'rgb(99, 102, 241)',
//                         pointHoverBorderWidth: 2,
//                         pointRadius: 4,
//                         spanGaps: true
//                       }]
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           display: false,
//                         },
//                         tooltip: {
//                           mode: 'index',
//                           intersect: false,
//                           backgroundColor: 'rgba(17, 24, 39, 0.9)',
//                           titleColor: 'rgb(255, 255, 255)',
//                           bodyColor: 'rgb(255, 255, 255)',
//                           borderColor: 'rgb(75, 85, 99)',
//                           borderWidth: 1,
//                           padding: 10,
//                           displayColors: false,
//                         },
//                       },
//                       scales: {
//                         x: {
//                           grid: {
//                             display: false,
//                             color: 'rgba(75, 85, 99, 0.2)',
//                           },
//                           ticks: {
//                             color: 'rgb(156, 163, 175)',
//                             maxRotation: 0,
//                             autoSkip: true,
//                             maxTicksLimit: 6,
//                           },
//                         },
//                         y: {
//                           beginAtZero: false,
//                           grid: {
//                             color: 'rgba(75, 85, 99, 0.2)',
//                           },
//                           ticks: {
//                             color: 'rgb(156, 163, 175)',
//                             callback: function(value) {
//                               return value + ' kg';
//                             },
//                           },
//                         },
//                       },
//                       interaction: {
//                         mode: 'nearest',
//                         axis: 'x',
//                         intersect: false,
//                       },
//                     }}
//                   />
//                 </div>
//               ) : (
//                 <div className="h-64 flex items-center justify-center text-gray-500">
//                   No weight data available
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* Calories Burned Graph */}
//         <div className="mb-8">
//           <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-800">
//               <h3 className="font-semibold text-white">Calories Burned</h3>
//             </div>
//             <div className="p-6">
//               {progressData.calorieHistory && progressData.calorieHistory.length > 0 ? (
//                 <div className="h-64">
//                   <Line 
//                     data={{
//                       labels: progressData.calorieHistory.map(entry => {
//                         try {
//                           const date = new Date(entry.date);
//                           return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//                         } catch (error) {
//                           console.error('Error formatting date:', error);
//                           return 'Invalid Date';
//                         }
//                       }),
//                       datasets: [{
//                         label: 'Calories Burned',
//                         data: progressData.calorieHistory.map(entry => {
//                           const calories = parseFloat(entry.calories);
//                           return isNaN(calories) ? null : calories;
//                         }),
//                         fill: true,
//                         borderColor: 'rgb(234, 179, 8)',
//                         backgroundColor: 'rgba(234, 179, 8, 0.1)',
//                         tension: 0.4,
//                         pointBackgroundColor: 'rgb(234, 179, 8)',
//                         pointBorderColor: '#fff',
//                         pointBorderWidth: 2,
//                         pointHoverBackgroundColor: '#fff',
//                         pointHoverBorderColor: 'rgb(234, 179, 8)',
//                         pointHoverBorderWidth: 2,
//                         pointRadius: 4,
//                         spanGaps: true
//                       }]
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           display: false,
//                         },
//                         tooltip: {
//                           mode: 'index',
//                           intersect: false,
//                           backgroundColor: 'rgba(17, 24, 39, 0.9)',
//                           titleColor: 'rgb(255, 255, 255)',
//                           bodyColor: 'rgb(255, 255, 255)',
//                           borderColor: 'rgb(75, 85, 99)',
//                           borderWidth: 1,
//                           padding: 10,
//                           displayColors: false,
//                         },
//                       },
//                       scales: {
//                         x: {
//                           grid: {
//                             display: false,
//                             color: 'rgba(75, 85, 99, 0.2)',
//                           },
//                           ticks: {
//                             color: 'rgb(156, 163, 175)',
//                             maxRotation: 0,
//                             autoSkip: true,
//                             maxTicksLimit: 6,
//                           },
//                         },
//                         y: {
//                           beginAtZero: true,
//                           grid: {
//                             color: 'rgba(75, 85, 99, 0.2)',
//                           },
//                           ticks: {
//                             color: 'rgb(156, 163, 175)',
//                             callback: function(value) {
//                               return value + ' kcal';
//                             },
//                           },
//                         },
//                       },
//                       interaction: {
//                         mode: 'nearest',
//                         axis: 'x',
//                         intersect: false,
//                       },
//                     }}
//                   />
//                 </div>
//               ) : (
//                 <div className="h-64 flex items-center justify-center text-gray-500">
//                   No calorie data available
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Progress;