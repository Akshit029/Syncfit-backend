// client/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Nutrition from "./components/Nutrition";
// import Workouts from "./components/Workouts";
// import Progress from "./components/Progress";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import ForgotPassword from "./components/ForgotPassword";
import AboutUs from "./components/About";
import Profile from "./components/Profile";
import HealthCalculator from "./components/HealthCalculator";
import FeedbackForm from "./components/FeedbackForm";

// Configure axios defaults
const API_URL = process.env.REACT_APP_API_URL || 'https://syncfit-ez0z.onrender.com';
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for error handling
axios.interceptors.request.use(
  config => {
    // Add timestamp to prevent caching
    config.params = { ...config.params, _t: Date.now() };
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config.url);
    }
    return Promise.reject(error);
  }
);

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("/")
      .then((response) => {
        setMessage(response.data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar will be at the top */}
        <Navbar />
      <div className="App">
        <h1>{message}</h1>
        <Routes> {/* Replace Switch with Routes */}
          <Route path="/" element= {<Home/> } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/nutrition" element={<Nutrition />} />
          {/* <Route path="/workouts" element={<Workouts />} /> */}
          {/* <Route path="/progress" element={<Progress />} /> */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/healthcalculator" element={<HealthCalculator />} />
          <Route path="/feedback" element={<FeedbackForm />} />
        </Routes>
      </div>
      </div>
    </Router>
  );
}

export default App;
