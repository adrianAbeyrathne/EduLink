import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ValidatedInput from '../Common/ValidatedInput';
import ValidationUtils from '../../utils/ValidationUtils';
import AddUserProfilePic from '../AddUserProfilePic/AddUserProfilePic';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddUserEnhanced = ({ onUserAdded }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    age: '',
    status: 'active'
  });
  
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const validation = ValidationUtils.validateForm(formData, {
      name: { required: true, label: 'Name' },
      email: { required: true, label: 'Email' },
      age: { required: true, label: 'Age' },
      role: { required: true, label: 'Role' },
      status: { required: true, label: 'Status' }
    });

    setFormErrors(validation.errors);
    return validation;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate form
    const validation = validateForm();
    
    if (!validation.isValid) {
      const errorCount = Object.keys(validation.errors).length;
      toast.error(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} before submitting`);
      
      // Focus on first invalid field
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.focus();
      }
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Submitting validated form data:', validation.sanitized);
      
      const response = await axios.post('http://localhost:5000/api/users', validation.sanitized, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201 && response.data.success) {
        toast.success('✅ User created successfully!', {
          duration: 4000,
          position: 'top-center',
        });
        
        setCreatedUserId(response.data.users._id);
        setCreatedUser(response.data.users);
        
        // Show generated password info
        if (response.data.generatedPassword) {
          toast.success(`Generated password: ${response.data.generatedPassword}`, {
            duration: 8000,
            position: 'top-center',
          });
        }
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'student',
          age: '',
          status: 'active'
        });
        
        setTouched({});
        setFormErrors({});
        
        // Notify parent component if callback provided
        if (onUserAdded) {
          onUserAdded(response.data.users);
        }
      }
    } catch (error) {
      console.error('❌ Error adding user:', error);
      
      if (error.response?.data?.errors) {
        // Handle backend validation errors
        setFormErrors(error.response.data.errors);
        
        const errorMessages = ValidationUtils.displayErrors(error.response.data.errors, false);
        toast.error(`Validation failed: ${errorMessages[0]}`);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to add user. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldValidation = (fieldName) => {
    const validation = ValidationUtils.validateFormField(fieldName, formData[fieldName], formData);
    return {
      ...validation,
      hasError: formErrors[fieldName]?.length > 0,
      backendErrors: formErrors[fieldName] || []
    };
  };

  const renderFormErrors = () => {
    if (Object.keys(formErrors).length === 0) return null;
    
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
        <ul className="text-red-700 text-sm space-y-1">
          {Object.entries(formErrors).map(([field, errors]) => (
            errors.map((error, index) => (
              <li key={`${field}-${index}`} className="flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                <span className="capitalize">{field}</span>: {error}
              </li>
            ))
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Add New User</h2>
          <p className="text-gray-600">Create a new user account with professional validation</p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          {!createdUserId ? (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {renderFormErrors()}
              
              {/* Name Field */}
              <ValidatedInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                label="Full Name"
                placeholder="Enter full name"
                required
                userInfo={formData}
                autoComplete="name"
                showValidation={true}
              />

              {/* Email Field */}
              <ValidatedInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                label="Email Address"
                placeholder="Enter email address"
                required
                userInfo={formData}
                autoComplete="email"
                showValidation={true}
              />

              {/* Role Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
                {/* Error display temporarily disabled due to TypeScript issues */}
                {/* {formErrors && formErrors.role && formErrors.role.length > 0 && (
                  <p className="mt-1 text-red-600 text-xs">{formErrors.role[0]}</p>
                )} */}
              </div>

              {/* Age Field */}
              <ValidatedInput
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                label="Age"
                placeholder="Enter age"
                min="1"
                max="150"
                required
                userInfo={formData}
                autoComplete="off"
                showValidation={true}
              />

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
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {/* Error display temporarily disabled due to TypeScript issues */}
                {/* {formErrors && formErrors.status && formErrors.status.length > 0 && (
                  <p className="mt-1 text-red-600 text-xs">{formErrors.status[0]}</p>
                )} */}
              </div>

              {/* Form Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Admin User Creation</p>
                    <p>A secure password will be automatically generated for this user. They should change it upon first login.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating User...
                  </div>
                ) : 'Create User'}
              </button>
            </form>
          ) : (
            // Success state with user creation confirmation
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900">User Created Successfully!</h3>
                <p className="text-gray-600 mt-2">
                  {createdUser?.name} has been added as a {createdUser?.role}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Email: {createdUser?.email}
                </p>
              </div>

              {/* Profile Picture Upload */}
              {createdUser?.profilePic && (
                <div className="mt-4">
                  <img src={`http://localhost:5000${createdUser.profilePic}?v=${Date.now()}`} alt="Profile" className="mx-auto rounded-full w-32 h-32 object-cover border-4 border-white shadow-lg" />
                  <p className="mt-2 text-sm text-green-600 font-medium">Profile picture uploaded!</p>
                </div>
              )}

              <AddUserProfilePic 
                userId={createdUserId} 
                onProfilePicUploaded={(updatedUser) => setCreatedUser(updatedUser)} 
              />
              
              {/* Navigation buttons */}
              <div className="flex flex-col gap-3">
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
                    setFormErrors({});
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
          <p><span className="text-red-500">*</span> Required fields</p>
          <p className="mt-1">All data is validated in real-time for your convenience</p>
        </div>
      </div>
    </div>
  );
};

export default AddUserEnhanced;