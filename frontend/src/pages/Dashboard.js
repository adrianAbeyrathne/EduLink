// Dashboard.jsx
import React from 'react';
import Layout from '../Components/Layout/Layout';
import StudentDashboard from '../Components/dashboard/StudentDashboard';
import TutorDashboard from '../Components/dashboard/TutorDashboard';
import AdminDashboard from '../Components/dashboard/AdminDashboard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If not authenticated, redirect will be handled by ProtectedRoute
  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }
  
  const userRole = user.role;

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome message */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user.name}!
            </h1>
            <p className="text-gray-600">
              Role: <span className="font-medium text-indigo-600 capitalize">{user.role}</span>
            </p>
          </div>

          {/* Render the appropriate dashboard based on user role */}
          {userRole === 'student' && <StudentDashboard />}
          {userRole === 'tutor' && <TutorDashboard />}
          {userRole === 'admin' && <AdminDashboard />}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;