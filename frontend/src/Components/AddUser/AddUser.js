import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddUserProfilePic from '../AddUserProfilePic/AddUserProfilePic';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddUser = ({ onUserAdded }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    age: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const ageNumber = parseInt(formData.age);
    if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 150) {
      toast.error('Age must be between 1 and 150');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users', {
        ...formData,
        age: parseInt(formData.age)
      });
      if (response.status === 201) {
        toast.success('User added successfully!');
        setCreatedUserId(response.data.users._id);
        setCreatedUser(response.data.users);
        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'student',
          age: '',
          status: 'active'
        });
        // Notify parent component if callback provided
        if (onUserAdded) {
          onUserAdded(response.data.users);
        }
      }
    } catch (error) {
      console.error('Error adding user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add New User</h2>
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          {!createdUserId ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Role Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Age Field */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="150"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter age"
                  required
                />
              </div>

              {/* Status Field */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Adding User...' : 'Add User'}
              </button>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center text-green-600">
                ✅ User Created Successfully!
              </h3>
              <div className="mb-4 text-center">
                <p className="text-gray-600">User "{createdUser?.name}" has been added to the system.</p>
              </div>
              
              <h3 className="text-lg font-semibold mb-4 text-center">Upload Profile Picture (Optional)</h3>
              <AddUserProfilePic userId={createdUserId} onProfilePicUploaded={(user) => setCreatedUser(user)} />
              {createdUser && createdUser.profilePic && (
                <div className="mt-4 text-center">
                  <img src={`http://localhost:5000${createdUser.profilePic}?v=${Date.now()}`} alt="Profile" className="mx-auto rounded-full w-32 h-32 object-cover border" />
                  <p className="mt-2 text-sm text-gray-600">Profile picture uploaded!</p>
                </div>
              )}
              
              {/* Navigation buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate('/user-management')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  <span>Go to User Management</span>
                </button>
                
                <button
                  onClick={() => {
                    setCreatedUserId(null);
                    setCreatedUser(null);
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>Add Another User</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>* Required fields</p>
        </div>
      </div>
    </div>
  );
};

export default AddUser;