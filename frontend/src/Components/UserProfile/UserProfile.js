import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  CalendarIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  MapPinIcon,
  GraduationCapIcon,
  CameraIcon,
  TrashIcon
} from 'lucide-react';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    phone: '',
    location: '',
    subjects: '',
    experience: '',
    userStatus: 'Available'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const fileInputRef = useRef(null);

  const statusOptions = ['Available', 'Away', 'Busy', 'Do Not Disturb'];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        phone: user.phone || '',
        location: user.location || '',
        subjects: user.subjects?.join(', ') || '',
        experience: user.experience || '',
        userStatus: user.userStatus || 'Available'
      });
      
      // Set profile picture preview if exists
      if (user.profilePic) {
        setProfilePicPreview(user.profilePic);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Profile picture must be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);

    const response = await fetch(`http://localhost:5000/api/users/${user._id}/profile-pic`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    return result;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Upload profile picture first if there's one
      let profilePicPath = user.profilePic;
      if (profilePicture) {
        const uploadResult = await uploadProfilePicture(profilePicture);
        if (uploadResult.success) {
          profilePicPath = uploadResult.user.profilePic;
        } else {
          throw new Error(uploadResult.message || 'Failed to upload profile picture');
        }
      } else if (profilePicPreview === null && user.profilePic) {
        // User removed profile picture
        const deleteResponse = await fetch(`http://localhost:5000/api/users/${user._id}/profile-pic`, {
          method: 'DELETE'
        });
        const deleteResult = await deleteResponse.json();
        if (deleteResult.success) {
          profilePicPath = '';
        }
      }

      const updateData = {
        ...formData,
        subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [],
        profilePic: profilePicPath
      };

      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setProfilePicture(null);
        
        // Update user context with the updated user data
        if (updateUser) {
          updateUser(result.user || result.users);
        }
        
        // Reload to show updated status without page refresh
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicPreview(user?.profilePic || null);
    
    // Reset form data to original values
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        phone: user.phone || '',
        location: user.location || '',
        subjects: user.subjects?.join(', ') || '',
        experience: user.experience || '',
        userStatus: user.userStatus || 'Available'
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Away': return 'bg-yellow-100 text-yellow-800';
      case 'Busy': return 'bg-red-100 text-red-800';
      case 'Do Not Disturb': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePicPreview ? (
                    <img 
                      src={profilePicPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10" />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 bg-white text-gray-800 rounded-full hover:bg-gray-100"
                        title="Upload Picture"
                      >
                        <CameraIcon className="h-3 w-3" />
                      </button>
                      {(profilePicPreview || user.profilePic) && (
                        <button
                          onClick={handleRemoveProfilePicture}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Remove Picture"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-blue-100 capitalize">{user.role}</p>
                  <span className="text-blue-100">•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.userStatus)}`}>
                    {formData.userStatus}
                  </span>
                </div>
                <p className="text-blue-100 text-sm">
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
              disabled={loading}
            >
              {isEditing ? <XIcon className="h-5 w-5" /> : <EditIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-900">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <MailIcon className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-900">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{user.age || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-900">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{user.phone || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-900">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{user.location || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                {isEditing ? (
                  <select
                    name="userStatus"
                    value={formData.userStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.userStatus)}`}>
                    {formData.userStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {user.role === 'student' ? 'Session Information' : 
                 user.role === 'tutor' ? 'Teaching Information' : 
                 'Administrative Information'}
              </h3>
              
              {/* Role-specific fields */}
              {user.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Notes</label>
                    {isEditing ? (
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add notes about your learning sessions, progress, and observations..."
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-md min-h-[100px]">
                        {user.experience || 'No session notes added'}
                      </p>
                    )}
                  </div>
                </>
              )}

              {user.role === 'tutor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Subjects</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="subjects"
                        value={formData.subjects}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Mathematics, Physics, Computer Science"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <GraduationCapIcon className="h-4 w-4" />
                        <span>{user.subjects?.join(', ') || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Experience</label>
                    {isEditing ? (
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your teaching experience and qualifications..."
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-md">
                        {user.experience || 'No teaching experience provided'}
                      </p>
                    )}
                  </div>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Administrative Role</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="subjects"
                        value={formData.subjects}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. System Administrator, Academic Coordinator"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <GraduationCapIcon className="h-4 w-4" />
                        <span>{user.subjects?.join(', ') || 'System Administrator'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Administrative Notes</label>
                    {isEditing ? (
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Administrative responsibilities and notes..."
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-md">
                        {user.experience || 'No administrative notes'}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Account Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  {user.isVerified && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Last Login Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <p className="text-sm text-gray-600">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;