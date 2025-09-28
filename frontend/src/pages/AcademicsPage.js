import React from 'react';
import Nav from '../Components/Nav/Nav';
import { useAuth } from '../context/AuthContext';

function AcademicsPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Academics</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {userRole} View
              </span>
            </div>
            <p className="text-gray-600 mb-8">Explore courses, view academic resources, and track your progress.</p>
            
            {/* Role-based content placeholder */}
            {userRole === 'student' && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-blue-800">
                  <strong>Student View:</strong> Access your enrolled courses, view grades, and manage assignments.
                </p>
              </div>
            )}
            
            {userRole === 'tutor' && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400">
                <p className="text-green-800">
                  <strong>Tutor View:</strong> Manage your courses, view student progress, and create assignments.
                </p>
              </div>
            )}
            
            {userRole === 'admin' && (
              <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-400">
                <p className="text-purple-800">
                  <strong>Admin View:</strong> Oversee all courses, manage curriculum, and view system-wide analytics.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Computer Science</h3>
                <p className="text-blue-700 mb-4">Programming, algorithms, and software development courses</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">12 Courses</span>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Mathematics</h3>
                <p className="text-green-700 mb-4">Calculus, algebra, statistics, and advanced mathematics</p>
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">8 Courses</span>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Engineering</h3>
                <p className="text-purple-700 mb-4">Mechanical, electrical, and civil engineering programs</p>
                <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">15 Courses</span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">📝 Placeholder for Team Members</h3>
              <p className="text-yellow-800">
                This page is ready for your team members to add their academic content. The navigation and routing are already set up.
                Team members can replace this content with their specific academic modules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademicsPage;