import React from 'react';
import UserManagement from '../Components/UserManagement/UserManagement';
import Nav from '../Components/Nav/Nav';
import { Users } from 'lucide-react';

const UserManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Admin - User Management</h1>
            </div>
            <div className="text-sm text-gray-600">
              EduLink Admin Panel
            </div>
          </div>
        </div>
      </div>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;