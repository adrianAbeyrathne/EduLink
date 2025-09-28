import React from 'react';
import Nav from '../Components/Nav/Nav';
import { useAuth } from '../context/AuthContext';

function HelpPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {userRole} Support
              </span>
            </div>
            <p className="text-gray-600 mb-8">Find answers to frequently asked questions and get support.</p>
            
            {/* Role-based help content */}
            {userRole === 'student' && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-blue-800">
                  <strong>Student Support:</strong> Get help with course enrollment, assignments, and technical issues.
                </p>
              </div>
            )}
            
            {userRole === 'tutor' && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400">
                <p className="text-green-800">
                  <strong>Tutor Support:</strong> Access teaching resources, session management tools, and payment help.
                </p>
              </div>
            )}
            
            {userRole === 'admin' && (
              <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-400">
                <p className="text-purple-800">
                  <strong>Admin Support:</strong> System administration, user management, and platform configuration help.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• How to create an account</li>
                  <li>• Setting up your profile</li>
                  <li>• Joining your first study group</li>
                  <li>• Navigating the dashboard</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account & Settings</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• Updating your information</li>
                  <li>• Privacy settings</li>
                  <li>• Notification preferences</li>
                  <li>• Password reset</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Need More Help?</h3>
              <p className="text-indigo-700 mb-4">Contact our support team for personalized assistance.</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Contact Support
              </button>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">🛠️ Placeholder for Team Members</h3>
              <p className="text-yellow-800">
                This Help Center page is ready for your team members to add comprehensive support content. 
                The navigation and routing are already set up. Team members can replace this content with their specific help modules and FAQ sections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;