import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, User, Award, TrendingUp, BookOpen } from 'lucide-react';

const NewUserExperience = ({ userProgress, onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const onboardingSteps = [
    {
      id: 1,
      title: "Welcome to EduLink!",
      description: "Let's get you started with your learning journey",
      icon: <User className="w-8 h-8 text-blue-500" />,
      action: "welcome"
    },
    {
      id: 2,
      title: "Complete Your Profile",
      description: "Add a profile picture and bio to personalize your experience",
      icon: <User className="w-8 h-8 text-green-500" />,
      action: "complete_profile"
    },
    {
      id: 3,
      title: "Explore Features",
      description: "Discover what EduLink has to offer",
      icon: <BookOpen className="w-8 h-8 text-purple-500" />,
      action: "explore_features"
    },
    {
      id: 4,
      title: "Set Your Goals",
      description: "Define your weekly learning targets",
      icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
      action: "set_goals"
    },
    {
      id: 5,
      title: "You're All Set!",
      description: "Ready to start your learning adventure",
      icon: <Award className="w-8 h-8 text-yellow-500" />,
      action: "complete"
    }
  ];

  const currentStepData = onboardingSteps.find(step => step.id === currentStep);

  const handleStepComplete = () => {
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);
    
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      updateOnboardingProgress(newCompletedSteps, true);
    }
  };

  const updateOnboardingProgress = async (steps, completed = false) => {
    try {
      await fetch(`http://localhost:5000/api/user-journey/onboarding/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentStep: completed ? onboardingSteps.length : currentStep + 1,
          completedSteps: steps
        })
      });
      
      if (completed && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    }
  };

  const skipOnboarding = async () => {
    try {
      await fetch(`http://localhost:5000/api/user-journey/onboarding/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skipOnboarding: true
        })
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStepData?.action) {
      case 'welcome':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome, {user?.name}! 👋
            </h3>
            <p className="text-gray-600 mb-6">
              We're excited to have you join our learning community. 
              Let's take a quick tour to get you started.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800 font-medium">
                💡 Did you know? Completing your profile increases your chances of finding the perfect study partners by 60%!
              </p>
            </div>
          </div>
        );
        
      case 'complete_profile':
        const profileCompletion = userProgress?.profileCompletionPercentage || 0;
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Complete Your Profile
            </h3>
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Profile {profileCompletion}% complete
              </p>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-center">
                <CheckCircle className={`w-5 h-5 mr-3 ${userProgress?.profileCompletionStatus?.basicInfo ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={userProgress?.profileCompletionStatus?.basicInfo ? 'text-gray-800' : 'text-gray-500'}>
                  Basic Information
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className={`w-5 h-5 mr-3 ${userProgress?.profileCompletionStatus?.profilePicture ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={userProgress?.profileCompletionStatus?.profilePicture ? 'text-gray-800' : 'text-gray-500'}>
                  Profile Picture
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className={`w-5 h-5 mr-3 ${userProgress?.profileCompletionStatus?.bio ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={userProgress?.profileCompletionStatus?.bio ? 'text-gray-800' : 'text-gray-500'}>
                  Bio & Description
                </span>
              </div>
            </div>
          </div>
        );
        
      case 'explore_features':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Explore Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800 mb-2">Study Sessions</h4>
                <p className="text-blue-600 text-sm">Join live study sessions with peers and mentors</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 mb-2">Achievements</h4>
                <p className="text-green-600 text-sm">Earn points and unlock rewards for your progress</p>
              </div>
            </div>
          </div>
        );
        
      case 'set_goals':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Set Your Learning Goals
            </h3>
            <p className="text-gray-600 mb-6">
              How many study sessions would you like to complete per week?
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              {[2, 3, 4, 5].map(goal => (
                <button
                  key={goal}
                  className="bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {goal} sessions
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Congratulations!
            </h3>
            <p className="text-gray-600 mb-6">
              You're all set up and ready to start your learning journey. 
              Welcome to the EduLink community!
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-medium">
                🏆 You've earned your first 60 points! Keep learning to unlock more achievements.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {onboardingSteps.length}
            </span>
            <button
              onClick={skipOnboarding}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Skip tour
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / onboardingSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step icon */}
        <div className="text-center mb-4">
          {currentStepData?.icon}
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={handleStepComplete}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {currentStep === onboardingSteps.length ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewUserExperience;