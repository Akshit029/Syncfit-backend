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
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
axios.defaults.withCredentials = true;

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
