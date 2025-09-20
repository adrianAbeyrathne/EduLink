import React from 'react';
import UserDetails from '../Components/UserDetails/UserDetails';
import Nav from '../Components/Nav/Nav';

const UserDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <UserDetails />
    </div>
  );
};

export default UserDetailsPage;