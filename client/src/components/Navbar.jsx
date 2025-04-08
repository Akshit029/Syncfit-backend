import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom'; //useNavigate,
import axios from 'axios';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // const navigate = useNavigate();
  const location = useLocation();  // Get the current location/path

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoize checkCurrentUser to prevent unnecessary re-renders
  const checkCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get('https://syncfit-j7pw.onrender.com/api/auth/me', {
        withCredentials: true,
      });

      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        setIsLoggedIn(true);
        setUserName(response.data.user.name);
      }
    } catch (err) {
      // User not authenticated - ensure the UI reflects this
      setIsLoggedIn(false);
      setUserName('');
    }
  }, []);

  // Memoize checkAuthStatus to prevent unnecessary re-renders
  const checkAuthStatus = useCallback(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserName(user.name);
    } else {
      // If no userData in localStorage, update UI accordingly
      setIsLoggedIn(false);
      setUserName('');
      // Try to get fresh data from server
      checkCurrentUser();
    }
  }, [checkCurrentUser]);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
    // Check auth status on route change to catch logout redirection
    checkAuthStatus();
  }, [location.pathname, checkAuthStatus]);

  // Check user authentication status when component mounts
  useEffect(() => {
    checkAuthStatus();
    
    // This specific event listener will help detect changes from other tabs,
    // but won't catch same-window changes from Profile.jsx
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [checkAuthStatus]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Helper function to check if the current path matches the link
  const isActive = (path) => location.pathname === path;

  // Get first letter of user name for avatar (only used when logged in)
  const getNameInitial = () => {
    if (userName && userName.length > 0) {
      return userName.charAt(0).toUpperCase();
    }
    return '';
  };

  const navbarClasses = `fixed top-0 w-full z-50 ${scrolled ? 'bg-black bg-opacity-70 shadow-lg backdrop-blur-sm' : 'bg-black'} text-white transition-all duration-300 py-4`;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          {/* Left Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">SyncFit</span>
          </Link>

          {/* Center Navigation Links */}
          <div className="flex space-x-6 mx-auto">
            {!isActive('/') && (
              <Link to="/" className="text-white hover:text-blue-500 transition duration-300 relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            {!isActive('/dashboard') && (
              <Link to="/dashboard" className="text-white hover:text-blue-500 transition duration-300 relative group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            {!isActive('/healthcalculator') && (
              <Link to="/healthcalculator" className="text-white hover:text-blue-500 transition duration-300 relative group">
                Health Calculator
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            {!isActive('/nutrition') && (
              <Link to="/nutrition" className="text-white hover:text-blue-500 transition duration-300 relative group">
                Nutrition
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            {/* {!isActive('/progress') && (
              <Link to="/progress" className="text-white hover:text-blue-500 transition duration-300 relative group">
                Progress
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )} */}
            {/* {!isActive('/workouts') && (
              <Link to="/workouts" className="text-white hover:text-blue-500 transition duration-300 relative group">
                Workouts
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )} */}
            {!isActive('/settings') && (
              <Link to="/settings" className="text-white hover:text-blue-500 transition duration-300 relative group">
                Settings
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </div>

          {/* Right Login/Profile/Signup Buttons */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-400 hover:to-blue-500 transition duration-300 shadow-lg"
              >
                {getNameInitial()}
              </Link>
            ) : (
              <div className="space-x-4">
                {!isActive('/login') && (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-300 shadow-md"
                >
                  Login
                </Link>
                )}
                {!isActive('/signup') && (
                <Link
                  to="/signup"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
                >
                  Sign Up
                </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">SyncFit</span>
          </Link>

          {/* User Avatar or Hamburger Menu */}
          <div className="flex items-center space-x-3">
            {isLoggedIn && (
              <Link
                to="/profile"
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full hover:from-blue-400 hover:to-blue-500 transition duration-300 shadow-md"
              >
                {getNameInitial()}
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 animate-fadeIn">
            {/* Navigation Links for Mobile */}
            <div className="flex flex-col space-y-3 bg-gray-900 rounded-lg p-4">
              {!isActive('/') && (
                <Link
                  to="/"
                  className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white rounded-md transition duration-300"
                >
                  Home
                </Link>
              )}
              {!isActive('/dashboard') && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white rounded-md transition duration-300"
                >
                  Dashboard
                </Link>
              )}
              {!isActive('/healthcalculator') && (
                <Link
                  to="/healthcalculator"
                  className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white rounded-md transition duration-300"
                >
                  Health Calculator
                </Link>
              )}
              {!isActive('/nutrition') && (
                <Link
                  to="/nutrition"
                  className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white rounded-md transition duration-300"
                >
                  Nutrition
                </Link>
              )}
              {/* {!isActive('/progress') && (
                <Link
                  to="/progress"
                  className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white rounded-md transition duration-300"
                >
                  Progress
                </Link>
              )} */}
              {/* {!isActive('/workouts') && (
                <Link
                  to="/workouts"
                  className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white rounded-md transition duration-300"
                >
                  Workouts
                </Link>
              )} */}
              {!isActive('/settings') && (
                <Link
                  to="/settings"
                  className="px-4 py-2 text-white hover:bg-blue-600 hover:text-white rounded-md transition duration-300"
                >
                  Settings
                </Link>
              )}
            </div>

            {/* Login/Signup Buttons in Mobile Menu - only show if not logged in */}
            {!isLoggedIn && (
              <div className="flex flex-col space-y-3 mt-4">
                <div className="flex flex-col space-y-3 bg-gray-900 rounded-lg p-4">
                  {!isActive('/login') && (
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-300 text-center shadow-md"
                  >
                    Login
                  </Link>
                  )}
                  {!isActive('/signup') && (
                  <Link
                    to="/signup"
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition duration-300 text-center"
                  >
                    Sign Up
                  </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;