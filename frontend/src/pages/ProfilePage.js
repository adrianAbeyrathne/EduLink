import React from 'react';
import Nav from '../Components/Nav/Nav';
import UserProfile from '../Components/Profile/UserProfile';

const ProfilePage = () => {
  return (
    <div>
      <Nav />
      <div className="bg-gray-100 min-h-screen pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;