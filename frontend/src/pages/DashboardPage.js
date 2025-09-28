import React, { useState, useEffect } from 'react';
import Nav from '../Components/Nav/Nav';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../Components/dashboard/StudentDashboard';
import TutorDashboard from '../Components/dashboard/TutorDashboard';
import AdminDashboard from '../Components/dashboard/AdminDashboard';
import NewUserExperience from '../Components/UserJourney/NewUserExperience';
import ExistingUserDashboard from '../Components/UserJourney/ExistingUserDashboard';

function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Get the user's actual role from auth context, default to 'student' if not set
  const userRole = user?.role || 'student';
  const storedDesiredRole = null; // placeholder if later you store intended role

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/user-journey/dashboard/${user._id}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        
        // Show onboarding for new users
        if (result.data.dashboardConfig?.showOnboarding) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh dashboard data
    fetchDashboardData();
  };

  const renderUserJourneyDashboard = () => {
    if (!dashboardData) return null;

    const { isNewUser, experienceLevel } = dashboardData;

    // New users get a simplified experience with focus on onboarding
    if (isNewUser || experienceLevel === 'new') {
      return (
        <div className="space-y-6">
          {/* Progress overview for new users */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Getting Started 🚀</h2>
            <p className="text-blue-100 mb-4">
              Complete your profile and explore features to unlock more of EduLink!
            </p>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Profile Completion</span>
                <span className="font-bold">{dashboardData.progress?.profileCompletionPercentage || 0}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${dashboardData.progress?.profileCompletionPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Next milestones for new users */}
          {dashboardData.nextMilestones && dashboardData.nextMilestones.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Next Milestones</h3>
              <div className="space-y-3">
                {dashboardData.nextMilestones.slice(0, 3).map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{milestone.description}</p>
                      <p className="text-sm text-gray-600">Earn {milestone.points} points</p>
                    </div>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic role-specific dashboard */}
          {userRole === 'student' && <StudentDashboard />}
          {userRole === 'tutor' && <TutorDashboard />}
          {userRole === 'admin' && <AdminDashboard />}
        </div>
      );
    }

    // Existing users get the full-featured dashboard
    return (
      <>
        <ExistingUserDashboard 
          userProgress={dashboardData.progress} 
          dashboardConfig={dashboardData.dashboardConfig}
        />
        
        {/* Role-specific content below the user journey dashboard */}
        <div className="mt-8">
          {userRole === 'student' && <StudentDashboard />}
          {userRole === 'tutor' && <TutorDashboard />}
          {userRole === 'admin' && <AdminDashboard />}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="bg-gray-100 min-h-screen pt-6 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="bg-gray-100 min-h-screen pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Welcome Message */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'User'}! 
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'})
              </span>
            </h1>
            <p className="text-gray-600">
              {user?.role === 'student' && 'Track your progress, join study sessions, and access resources for your courses.'}
              {user?.role === 'tutor' && 'Manage your sessions, track student progress, and share resources with your students.'}
              {user?.role === 'admin' && 'Manage users, roles, permissions, and monitor platform activity.'}
              {!user?.role && 'Welcome to EduLink! Your personalized learning platform.'}
            </p>
          </div>

          {user && user.role !== storedDesiredRole && storedDesiredRole && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
              You are logged in as <strong>{user.role}</strong>.
            </div>
          )}
          
          {/* Render user journey-aware dashboard */}
          {renderUserJourneyDashboard()}
        </div>
      </div>

      {/* New User Onboarding Modal */}
      {showOnboarding && (
        <NewUserExperience 
          userProgress={dashboardData?.progress}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

export default DashboardPage;