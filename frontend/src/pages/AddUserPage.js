import React from 'react';
import AddUser from '../Components/AddUser/AddUser';
import Nav from '../Components/Nav/Nav';

const AddUserPage = () => {
  const handleUserAdded = (newUser) => {
    // Handle the new user addition - could refresh data or show notification
    console.log('User added:', newUser);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="flex flex-col items-center justify-center">
        <AddUser onUserAdded={handleUserAdded} />
      </div>
    </div>
  );
};

export default AddUserPage;