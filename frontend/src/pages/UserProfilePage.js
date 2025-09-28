import React from 'react';
import UserProfile from '../Components/UserProfile/UserProfile';
import Nav from '../Components/Nav/Nav';

const UserProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <UserProfile />
    </div>
  );
};

export default UserProfilePage;