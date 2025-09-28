import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Users, BookOpen, Calendar } from 'lucide-react';

const ExistingUserDashboard = ({ userProgress, dashboardConfig }) => {
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (userProgress) {
      setWeeklyProgress(userProgress.activityStats?.weeklyProgress || 0);
      setAchievements(userProgress.achievements || []);
    }
  }, [userProgress]);

  const weeklyGoal = userProgress?.activityStats?.weeklyGoal || 3;
  const totalPoints = userProgress?.totalPoints || 0;
  const userLevel = userProgress?.userLevel || 'beginner';

  const progressPercentage = Math.min((weeklyProgress / weeklyGoal) * 100, 100);

  const recentActivity = [
    { type: 'session', title: 'Completed Math Study Session', time: '2 hours ago', points: 25 },
    { type: 'help', title: 'Accessed Help Center', time: '1 day ago', points: 15 },
    { type: 'achievement', title: 'Earned "Study Streak" badge', time: '2 days ago', points: 50 }
  ];

  const renderWidget = (widgetName, content) => {
    if (!dashboardConfig?.widgets?.[widgetName]) return null;
    return content;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'session': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'help': return <Users className="w-4 h-4 text-green-500" />;
      case 'achievement': return <Award className="w-4 h-4 text-yellow-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Back Message for Returning Users */}
      {dashboardConfig?.showWelcomeMessage && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome back! 🌟</h2>
          <p className="text-blue-100">
            You're making great progress. Let's continue your learning journey!
          </p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Level</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{userLevel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Sessions Completed</p>
              <p className="text-2xl font-bold text-gray-900">{userProgress?.activityStats?.sessionsCompleted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Achievements</p>
              <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goals Widget */}
      {renderWidget('weeklyGoals', (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Goal Progress</h3>
            <span className="text-sm text-gray-500">{weeklyProgress}/{weeklyGoal} sessions</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {weeklyGoal - weeklyProgress > 0 
              ? `${weeklyGoal - weeklyProgress} more sessions to reach your weekly goal!`
              : '🎉 Weekly goal achieved! Great job!'
            }
          </p>
        </div>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Widget */}
        {renderWidget('recentActivity', (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">+{activity.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Achievements Widget */}
        {renderWidget('achievements', (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {achievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">{achievement.points} pts</span>
                </div>
              ))}
              
              {achievements.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Complete activities to earn your first achievement!
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Analytics Widget */}
      {renderWidget('analytics', (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {userProgress?.activityStats?.loginStreak || 0}
              </div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round((userProgress?.activityStats?.sessionsCompleted || 0) / 4) || 0}
              </div>
              <p className="text-sm text-gray-600">Avg Weekly</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {userProgress?.activityStats?.resourcesAccessed || 0}
              </div>
              <p className="text-sm text-gray-600">Resources Used</p>
            </div>
          </div>
        </div>
      ))}

      {/* Mentoring Widget for Advanced Users */}
      {renderWidget('mentoring', (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Mentor Mode Available!</h3>
              <p className="text-sm text-green-100">Help other students and earn extra points</p>
            </div>
          </div>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Start Mentoring
          </button>
        </div>
      ))}

      {/* Suggested Actions */}
      {dashboardConfig?.suggestedActions && dashboardConfig.suggestedActions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested for You</h3>
          <div className="space-y-3">
            {dashboardConfig.suggestedActions.map((action, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                action.priority === 'high' ? 'border-red-400 bg-red-50' :
                action.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                'border-blue-400 bg-blue-50'
              }`}>
                <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Take Action →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExistingUserDashboard;