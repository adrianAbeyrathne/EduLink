import React from 'react';
import AddUser from '../Components/AddUser/AddUser';
import Nav from '../Components/Nav/Nav';

const AddUserPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <AddUser />
    </div>
  );
};

export default AddUserPage;