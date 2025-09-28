import React from 'react';
import Nav from '../Components/Nav/Nav';

function CoursesPage() {
  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">All Courses</h1>
            <p className="text-gray-600 mb-8">Browse all available courses and find study groups for each subject.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CS101 - Intro to Computer Science</h3>
                <p className="text-gray-600 mb-4">Learn programming fundamentals and basic algorithms</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">45 students</span>
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                    View Course
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">MATH101 - Calculus I</h3>
                <p className="text-gray-600 mb-4">Limits, derivatives, and basic integration</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">32 students</span>
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                    View Course
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CS201 - Data Structures</h3>
                <p className="text-gray-600 mb-4">Advanced programming with data structures and algorithms</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">28 students</span>
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                    View Course
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PHYS101 - General Physics</h3>
                <p className="text-gray-600 mb-4">Mechanics, thermodynamics, and wave motion</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">41 students</span>
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                    View Course
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ENG101 - English Composition</h3>
                <p className="text-gray-600 mb-4">Academic writing and communication skills</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">38 students</span>
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                    View Course
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CHEM101 - General Chemistry</h3>
                <p className="text-gray-600 mb-4">Atomic structure, bonding, and chemical reactions</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">35 students</span>
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                    View Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;