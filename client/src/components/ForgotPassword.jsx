import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Here, you would call your backend API to handle the password reset request
    if (email) {
      setTimeout(() => {
        alert('Password reset link has been sent to your email');
        navigate('/login');
        setIsLoading(false);
      }, 1000); // Simulating API call with timeout
    } else {
      alert('Please enter a valid email address');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4 py-12">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
          <p className="text-gray-400">We'll send you a reset link</p>
        </div>
        
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-300 ${
              isLoading 
                ? 'bg-blue-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg hover:shadow-blue-500/50'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Reset Link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Remembered your password?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Back to Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;