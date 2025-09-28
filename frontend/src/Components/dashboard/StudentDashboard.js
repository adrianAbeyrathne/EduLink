import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  BookIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  CheckIcon,
  StarIcon,
  MessageSquareIcon,
  ArrowRightIcon,
} from 'lucide-react'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [isNewUser, setIsNewUser] = useState(false)
  const [userStats, setUserStats] = useState({
    enrolledCourses: 0,
    studyGroups: 0,
    upcomingSessions: 0,
    savedResources: 0,
    completedTasks: 0,
    totalStudyHours: 0
  })

  useEffect(() => {
    if (user) {
      // Consider user as new if created within last 7 days or has minimal activity
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const createdAt = new Date(user.createdAt)
      
      const hasMinimalProfile = !user.phone || !user.location || (user.subjects && user.subjects.length === 0)
      const isRecentUser = createdAt > sevenDaysAgo
      
      setIsNewUser(isRecentUser || hasMinimalProfile)
      
      // Mock stats - in real app, these would come from API
      setUserStats({
        enrolledCourses: isRecentUser ? 0 : 4,
        studyGroups: isRecentUser ? 0 : 2,
        upcomingSessions: isRecentUser ? 0 : 3,
        savedResources: isRecentUser ? 0 : 12,
        completedTasks: isRecentUser ? 0 : 8,
        totalStudyHours: isRecentUser ? 0 : 24
      })
    }
  }, [user])

  if (isNewUser) {
    return (
      <div className="flex flex-col space-y-8">
        {/* Welcome Section for New Users */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to EduLink, {user?.name}! 🎉</h2>
          <p className="text-blue-100 mb-6">Let's get you started on your learning journey. Complete these steps to unlock the full potential of EduLink.</p>
        </div>

        {/* Getting Started Steps */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Getting Started Checklist</h3>
          <div className="space-y-4">
            {[
              {
                title: "Complete Your Profile",
                description: "Add your phone number, location, and interests to help us personalize your experience",
                completed: user?.phone && user?.location,
                action: "Complete Profile",
                link: "/profile"
              },
              {
                title: "Browse Available Courses",
                description: "Explore our course catalog and find subjects that interest you",
                completed: false,
                action: "Browse Courses",
                link: "/courses"
              },
              {
                title: "Join Study Groups",
                description: "Connect with other students studying similar subjects",
                completed: false,
                action: "Find Groups",
                link: "/study-groups"
              },
              {
                title: "Set Learning Goals",
                description: "Define what you want to achieve and track your progress",
                completed: false,
                action: "Set Goals",
                link: "/goals"
              }
            ].map((step, index) => (
              <div key={index} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {step.completed ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <span>{step.action}</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions for New Users */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Explore Courses</h3>
            <p className="text-sm text-gray-500 mb-4">Discover courses that match your interests and career goals</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Start Exploring
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find Study Buddies</h3>
            <p className="text-sm text-gray-500 mb-4">Connect with students who share your academic interests</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Find Students
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Sessions</h3>
            <p className="text-sm text-gray-500 mb-4">Book your first tutoring session or study group meeting</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Schedule Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-8">
      {/* Stats for Existing Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
              <BookIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Enrolled Courses
              </p>
              <p className="text-lg font-semibold text-gray-800">{userStats.enrolledCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Study Groups</p>
              <p className="text-lg font-semibold text-gray-800">{userStats.studyGroups}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Upcoming Sessions
              </p>
              <p className="text-lg font-semibold text-gray-800">{userStats.upcomingSessions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <FileTextIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Saved Resources
              </p>
              <p className="text-lg font-semibold text-gray-800">{userStats.savedResources}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content for Existing Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Today's Schedule
          </h3>
          {userStats.upcomingSessions > 0 ? (
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: 'Data Structures Study Group',
                  date: 'Today, 3:00 PM',
                  course: 'CS201',
                  type: 'study-group'
                },
                {
                  id: 2,
                  title: 'Calculus II Tutoring Session',
                  date: 'Today, 5:00 PM',
                  course: 'MATH102',
                  type: 'tutoring'
                },
                {
                  id: 3,
                  title: 'Programming Assignment Review',
                  date: 'Tomorrow, 2:00 PM',
                  course: 'CS101',
                  type: 'assignment'
                },
              ].map((session) => (
                <div
                  key={session.id}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${
                      session.type === 'study-group' ? 'bg-blue-100 text-blue-600' :
                      session.type === 'tutoring' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {session.type === 'study-group' ? <UsersIcon className="h-4 w-4" /> :
                       session.type === 'tutoring' ? <MessageSquareIcon className="h-4 w-4" /> :
                       <FileTextIcon className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="text-sm font-medium text-gray-900">
                      {session.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.date} • {session.course}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sessions scheduled for today</p>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Schedule a Session
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Your Progress
          </h3>
          <div className="space-y-4">
            {[
              {
                id: 1,
                name: 'Computer Science Fundamentals',
                code: 'CS101',
                progress: 75,
                nextDeadline: '2 days'
              },
              {
                id: 2,
                name: 'Calculus II',
                code: 'MATH102',
                progress: 60,
                nextDeadline: '1 week'
              },
              {
                id: 3,
                name: 'Data Structures',
                code: 'CS201',
                progress: 40,
                nextDeadline: '3 days'
              },
              {
                id: 4,
                name: 'Physics I',
                code: 'PHYS101',
                progress: 80,
                nextDeadline: '5 days'
              },
            ].map((course) => (
              <div key={course.id} className="group cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {course.name}
                  </p>
                  <span className="text-xs text-gray-500">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className={`h-2 rounded-full ${
                      course.progress >= 75 ? 'bg-green-500' :
                      course.progress >= 50 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">Next deadline: {course.nextDeadline}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">Study Streak</p>
                <p className="text-xs text-gray-600">5 days in a row! Keep it up!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Completed assignment', subject: 'Data Structures', time: '2 hours ago', type: 'success' },
            { action: 'Joined study group', subject: 'Calculus II', time: '1 day ago', type: 'info' },
            { action: 'Uploaded notes', subject: 'Physics I', time: '2 days ago', type: 'info' },
            { action: 'Scheduled tutoring session', subject: 'CS101', time: '3 days ago', type: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 py-2">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
              }`}></div>
              <div className="flex-grow">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.action}</span> in {activity.subject}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
