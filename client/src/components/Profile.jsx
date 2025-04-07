import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    memberSince: 'January 2022'
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [updateMessage, setUpdateMessage] = useState({ text: '', isError: false });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First try to get from localStorage
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const user = JSON.parse(storedData);
          setUserData({
            name: user.name || 'John Doe',
            email: user.email || 'johndoe@example.com',
            memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2022'
          });
          setFormData({
            name: user.name || '',
            email: user.email || ''
          });
        }

        // Also fetch from API to ensure data is up to date
        // Changed from /api/auth/me to /api/auth/user to match backend route
        const response = await axios.get('http://localhost:5001/api/auth/user', {
          withCredentials: true,
        });

        if (response.data.user) {
          const user = response.data.user;
          setUserData({
            name: user.name || 'John Doe',
            email: user.email || 'johndoe@example.com',
            memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'January 2022'
          });
          setFormData({
            name: user.name || '',
            email: user.email || ''
          });
          localStorage.setItem('userData', JSON.stringify(user));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Keep default data if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5001/api/auth/logout', {}, {
        withCredentials: true,
      });

      localStorage.removeItem('userData');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMessage({ text: '', isError: false });
    
    try {
      // Update user profile API call - changed endpoint to match backend
      // In Profile.jsx handleUpdateProfile function
        const response = await axios.put('http://localhost:5001/api/auth/update', formData, {
          withCredentials: true,
        });
      
      if (response.data.success) {
        // Update local data
        setUserData({
          ...userData,
          name: formData.name,
          email: formData.email
        });
        
        // Update localStorage
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const user = JSON.parse(storedData);
          user.name = formData.name;
          user.email = formData.email;
          localStorage.setItem('userData', JSON.stringify(user));
        }
        
        setUpdateMessage({ text: 'Profile updated successfully!', isError: false });
        setTimeout(() => {
          setIsEditing(false);
          setUpdateMessage({ text: '', isError: false });
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateMessage({ 
        text: err.response?.data?.message || 'Error updating profile. Please try again.', 
        isError: true 
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl text-center border border-gray-700">
          <div className="inline-block animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-lg font-medium text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen flex items-center justify-center px-4 sm:px-8 py-12">
      <div className="w-full max-w-md p-8 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-blue-400">
            {userData.name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-400">User Profile</h1>
        
        {isEditing ? (
          // Edit Profile Form
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-lg font-medium block text-gray-300">Username</label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 pl-4 text-base rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-lg font-medium block text-gray-300">Email</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 pl-4 text-base rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            {updateMessage.text && (
              <div className={`text-center p-3 rounded-lg text-base ${updateMessage.isError ? 'bg-red-900/70 text-red-200 border border-red-700' : 'bg-green-900/70 text-green-200 border border-green-700'}`}>
                {updateMessage.text}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-300 text-base font-medium shadow-lg hover:shadow-blue-500/20 border border-blue-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 text-base font-medium shadow-lg border border-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // Profile Info Display
          <>
            <div className="space-y-6 bg-gray-900/50 p-6 rounded-xl border border-gray-700 shadow-inner">
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-400 mb-1">Username</p>
                <p className="text-lg font-medium text-white break-words">{userData.name}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-400 mb-1">Email</p>
                <p className="text-lg font-medium text-white break-words">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-400 mb-1">Member Since</p>
                <p className="text-lg font-medium text-white">{userData.memberSince}</p>
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <div className="mt-8">
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-300 text-base font-medium shadow-lg hover:shadow-blue-500/20 border border-blue-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </button>
            </div>
            
            {/* Logout Button */}
            <div className="mt-4 text-center">
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-red-600/80 text-white rounded-lg hover:bg-red-500 transition duration-300 text-base font-medium shadow-lg hover:shadow-red-500/20 border border-red-500 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
                  <path d="M4 8a1 1 0 011-1h4a1 1 0 110 2H5a1 1 0 01-1-1z" />
                </svg>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;