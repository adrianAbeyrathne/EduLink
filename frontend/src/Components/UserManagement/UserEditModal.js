import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import toast from 'react-hot-toast';
import axios from 'axios';

const UserEditModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUserUpdated 
}) => {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    age: '',
    status: 'active',
    isVerified: false,
    suspensionReason: '',
    suspensionExpiry: '',
    forcePasswordReset: false,
    isLocked: false,
    adminNotes: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        age: user.age || '',
        status: user.status || 'active',
        isVerified: user.isVerified || false,
        suspensionReason: user.suspensionReason || '',
        suspensionExpiry: user.suspensionExpiry ? user.suspensionExpiry.split('T')[0] : '',
        forcePasswordReset: false,
        isLocked: user.isLocked || false,
        adminNotes: user.adminNotes || ''
      });
      
      // Fetch user activity when modal opens
      if (activeTab === 'activity') {
        fetchUserActivity();
      }
    }
  }, [user, isOpen, activeTab]);

  const fetchUserActivity = async () => {
    if (!user?._id) return;
    
    setLoadingActivities(true);
    try {
      // Temporarily disabled - will show placeholder message
      // const response = await axios.get(`http://localhost:5000/api/users/${user._id}/activity`);
      // setActivities(response.data.activities || []);
      setActivities([]); // Placeholder until backend activity logging is re-enabled
      toast('Activity logging temporarily disabled during feature updates', {
        icon: 'ℹ️',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
      toast.error('Failed to load user activity');
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear suspension fields if status is not suspended
    if (name === 'status' && value !== 'suspended') {
      setFormData(prev => ({
        ...prev,
        suspensionReason: '',
        suspensionExpiry: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare update data
      const updateData = { ...formData };
      
      // Handle suspension expiry date
      if (updateData.suspensionExpiry) {
        updateData.suspensionExpiry = new Date(updateData.suspensionExpiry).toISOString();
      }

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' && key !== 'adminNotes') {
          delete updateData[key];
        }
      });

      const response = await axios.put(
        `http://localhost:5000/api/users/${user._id}`, 
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('User updated successfully!');
      // Fix: Backend returns user data in response.data.users, not response.data
      onUserUpdated(response.data.users || response.data.user || response.data);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'tutor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Edit User: ${user.name}`}
      size="lg"
    >
      {/* User Overview */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {user.profilePic ? (
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={`http://localhost:5000${user.profilePic}?v=${Date.now()}`}
                alt={user.name}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
              {user.isAdminCreated && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  Admin Created
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {new Date(user.updatedAt || user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('activity');
              if (activities.length === 0 && !loadingActivities) {
                fetchUserActivity();
              }
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Log
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="150"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Account Status & Controls */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Account Status & Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Verification Status */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Email Verified</span>
              </label>
            </div>
          </div>

          {/* Suspension Details - Show only if status is suspended */}
          {formData.status === 'suspended' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h5 className="text-sm font-medium text-red-800 mb-3">Suspension Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Suspension Reason
                  </label>
                  <textarea
                    name="suspensionReason"
                    value={formData.suspensionReason}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter reason for suspension..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Suspension Expiry Date
                  </label>
                  <input
                    type="date"
                    name="suspensionExpiry"
                    value={formData.suspensionExpiry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-red-600 mt-1">Leave empty for indefinite suspension</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Controls */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Security Controls</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="forcePasswordReset"
                checked={formData.forcePasswordReset}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Force Password Reset on Next Login
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isLocked"
                checked={formData.isLocked}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Account Locked (prevent login)
              </span>
            </label>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Notes (Internal Use Only)
          </label>
          <textarea
            name="adminNotes"
            value={formData.adminNotes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any internal notes about this user..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
        )}

        {/* Activity Tab Content */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900">User Activity Log</h4>
              <button
                type="button"
                onClick={fetchUserActivity}
                disabled={loadingActivities}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                {loadingActivities ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loadingActivities ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No activity records found</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {activities.map((activity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.severity === 'high' || activity.severity === 'critical' 
                              ? 'bg-red-100 text-red-800'
                              : activity.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(activity.createdAt).toLocaleString()}</span>
                          {activity.adminId && (
                            <span>by {activity.adminId.name || 'Admin'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Show additional details if available */}
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600 font-medium mb-1">Details:</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          {Object.entries(activity.details).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium w-20">{key}:</span>
                              <span className="flex-1">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Activity Tab Actions */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
    </Modal>
  );
};

export default UserEditModal;