import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddUserProfilePic = ({ userId, onProfilePicUploaded }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a profile picture');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('profilePic', file);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/${userId}/profile-pic`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Profile picture uploaded!');
      if (onProfilePicUploaded) {
        onProfilePicUploaded(response.data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 mb-1">
          Profile Picture
        </label>
        <input
          type="file"
          id="profilePic"
          name="profilePic"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
          loading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Uploading...' : 'Upload Profile Picture'}
      </button>
    </form>
  );
};

export default AddUserProfilePic;
