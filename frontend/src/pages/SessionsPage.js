import React from 'react';
import Nav from '../Components/Nav/Nav';
import { useAuth } from '../context/AuthContext';

function SessionsPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Study Sessions</h1>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {userRole} View
              </span>
            </div>
            <p className="text-gray-600 mb-8">Join live study sessions, tutoring, and group discussions.</p>
            
            {/* Role-based content placeholder */}
            {userRole === 'student' && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-blue-800">
                  <strong>Student View:</strong> Join study sessions, book tutoring appointments, and collaborate with peers.
                </p>
              </div>
            )}
            
            {userRole === 'tutor' && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400">
                <p className="text-green-800">
                  <strong>Tutor View:</strong> Create study sessions, manage appointments, and conduct online tutoring.
                </p>
              </div>
            )}
            
            {userRole === 'admin' && (
              <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-400">
                <p className="text-purple-800">
                  <strong>Admin View:</strong> Monitor all sessions, manage tutor schedules, and oversee session quality.
                </p>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Calculus Study Group</h3>
                    <p className="text-gray-600 mt-1">Working through derivatives and integrals</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>Today, 3:00 PM</span>
                      <span className="mx-2">•</span>
                      <span>5 participants</span>
                    </div>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Join Session
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">JavaScript Fundamentals</h3>
                    <p className="text-gray-600 mt-1">Learn the basics of JavaScript programming</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>Tomorrow, 2:00 PM</span>
                      <span className="mx-2">•</span>
                      <span>8 participants</span>
                    </div>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Join Session
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Physics Lab Review</h3>
                    <p className="text-gray-600 mt-1">Review lab experiments and discuss results</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>Friday, 4:00 PM</span>
                      <span className="mx-2">•</span>
                      <span>3 participants</span>
                    </div>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Join Session
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">📅 Placeholder for Team Members</h3>
              <p className="text-yellow-800">
                This page is ready for your team members to add their session booking and management content. 
                The navigation and routing are already set up. Team members can replace this content with their specific session modules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionsPage;