// FeedbackForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    message: ''
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing feedback
    fetchFeedbacks();
    // Check authentication status
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/user', { withCredentials: true });
      setIsAuthenticated(!!response.data.user);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/feedback');
      setFeedbacks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showAlert('error', 'Please log in to submit feedback');
      navigate('/login');
      return;
    }
    
    if (!formData.name || !formData.message || formData.rating === 0) {
      showAlert('error', 'Please complete all required fields');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/feedback', formData, { withCredentials: true });
      
      // Add to local state with current date
      const newFeedback = {
        ...formData,
        date: new Date().toISOString(),
        _id: Date.now().toString() // Temporary ID until refresh
      };
      
      setFeedbacks([newFeedback, ...feedbacks]);
      showAlert('success', 'Feedback submitted successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        rating: 0,
        message: ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response?.status === 401) {
        showAlert('error', 'Please log in to submit feedback');
        navigate('/login');
      } else {
        showAlert('error', 'Failed to submit feedback. Please try again.');
      }
      setLoading(false);
    }
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="mx-auto bg-black pt-12 mt-12 px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text mb-3">
          Share Your Feedback
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          We're committed to constant improvement. Your insights help us create a better experience for everyone.
        </p>
        {!isAuthenticated && (
          <p className="text-yellow-500 mt-2">
            Please <a href="/login" className="text-indigo-400 hover:text-indigo-300">log in</a> to submit feedback.
          </p>
        )}
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          alert.type === 'success' 
            ? 'bg-green-950 text-green-400 border border-green-800' 
            : 'bg-red-950 text-red-400 border border-red-800'
        }`}>
          {alert.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Feedback Form */}
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-12 border border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-400 font-medium mb-2">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-400 font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email (optional)"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 font-medium mb-2">Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="text-2xl focus:outline-none transition-transform hover:scale-110"
                >
                  {formData.rating >= star ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-600">★</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-400 font-medium mb-2">Your Feedback</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              placeholder="Tell us about your experience..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Feedback */}
      <div className="mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h2 className="text-2xl font-bold text-white">Recent Feedback</h2>
      </div>

      {/* Feedback List */}
      {loading && feedbacks.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-400">No feedback submitted yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="bg-gray-900 rounded-xl border border-gray-800 p-6 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent"></div>
              
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(feedback.name)}
                  </div>
                  <span className="font-medium text-white">{feedback.name}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(feedback.date)}
                </div>
              </div>
              
              <div className="mb-3 flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < feedback.rating ? "text-yellow-400" : "text-gray-600"}>
                    ★
                  </span>
                ))}
              </div>
              
              <p className="text-gray-400">{feedback.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;