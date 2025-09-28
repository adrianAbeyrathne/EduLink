import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  BookIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  TrendingUpIcon,
  MessageSquareIcon,
  PlayIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  PlusIcon,
  SettingsIcon
} from 'lucide-react'

const TutorDashboard = () => {
  const { user } = useAuth()
  const [isNewTutor, setIsNewTutor] = useState(false)
  const [tutorStats, setTutorStats] = useState({
    coursesTeaching: 0,
    activeStudents: 0,
    upcomingSessions: 0,
    resourcesShared: 0,
    totalHoursTaught: 0,
    averageRating: 0,
    pendingRequests: 0
  })

  useEffect(() => {
    if (user) {
      // Consider tutor as new if created within last 14 days or has minimal teaching activity
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const createdAt = new Date(user.createdAt)
      
      const hasMinimalProfile = !user.subjects || user.subjects.length === 0 || !user.experience
      const isRecentTutor = createdAt > twoWeeksAgo
      
      setIsNewTutor(isRecentTutor || hasMinimalProfile)
      
      // Mock stats - in real app, these would come from API
      setTutorStats({
        coursesTeaching: isRecentTutor ? 0 : 3,
        activeStudents: isRecentTutor ? 0 : 42,
        upcomingSessions: isRecentTutor ? 0 : 5,
        resourcesShared: isRecentTutor ? 0 : 24,
        totalHoursTaught: isRecentTutor ? 0 : 156,
        averageRating: isRecentTutor ? 0 : 4.8,
        pendingRequests: isRecentTutor ? 0 : 3
      })
    }
  }, [user])

  if (isNewTutor) {
    return (
      <div className="flex flex-col space-y-8">
        {/* Welcome Section for New Tutors */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to EduLink Teaching Platform, {user?.name}! 🎓</h2>
          <p className="text-green-100 mb-6">Start your teaching journey with EduLink. Complete your setup to begin connecting with eager students.</p>
        </div>

        {/* Getting Started Steps for Tutors */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Teaching Setup Checklist</h3>
          <div className="space-y-4">
            {[
              {
                title: "Complete Your Teaching Profile",
                description: "Add your subjects, experience, qualifications, and teaching philosophy to attract students",
                completed: user?.subjects && user?.subjects.length > 0 && user?.experience,
                action: "Complete Profile",
                link: "/profile"
              },
              {
                title: "Set Your Teaching Subjects",
                description: "Define the subjects you want to teach and your expertise level",
                completed: false,
                action: "Set Subjects",
                link: "/teaching-setup"
              },
              {
                title: "Create Your First Course",
                description: "Design a course curriculum and set your availability",
                completed: false,
                action: "Create Course",
                link: "/courses/create"
              },
              {
                title: "Upload Teaching Resources",
                description: "Share notes, exercises, and materials to help your students learn",
                completed: false,
                action: "Add Resources",
                link: "/resources"
              },
              {
                title: "Set Your Availability",
                description: "Configure your teaching schedule and session preferences",
                completed: false,
                action: "Set Schedule",
                link: "/schedule"
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
                <button className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <span>{step.action}</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions for New Tutors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Course</h3>
            <p className="text-sm text-gray-500 mb-4">Design a comprehensive course to share your expertise with students</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Start Creating
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect with Students</h3>
            <p className="text-sm text-gray-500 mb-4">Browse student requests and start building your teaching community</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Find Students
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Sessions</h3>
            <p className="text-sm text-gray-500 mb-4">Set up your teaching calendar and availability preferences</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Setup Schedule
            </button>
          </div>
        </div>

        {/* Teaching Tips for New Tutors */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Teaching Tips for Success</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Personalize Your Approach</h4>
              <p className="text-sm text-blue-700">Every student learns differently. Adapt your teaching style to match their needs.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Prepare Interactive Materials</h4>
              <p className="text-sm text-green-700">Engage students with quizzes, exercises, and real-world examples.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Set Clear Expectations</h4>
              <p className="text-sm text-purple-700">Define learning goals and milestones to track student progress.</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Build Relationships</h4>
              <p className="text-sm text-orange-700">Create a supportive environment where students feel comfortable asking questions.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col space-y-8">
      {/* Stats for Experienced Tutors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
              <BookIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Courses Teaching</p>
              <p className="text-lg font-semibold text-gray-800">{tutorStats.coursesTeaching}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Students</p>
              <p className="text-lg font-semibold text-gray-800">{tutorStats.activeStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
              <p className="text-lg font-semibold text-gray-800">{tutorStats.upcomingSessions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <TrendingUpIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <div className="flex items-center">
                <p className="text-lg font-semibold text-gray-800">{tutorStats.averageRating}</p>
                <StarIcon className="h-4 w-4 text-yellow-400 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hours Taught</p>
              <p className="text-2xl font-bold text-gray-900">{tutorStats.totalHoursTaught}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resources Shared</p>
              <p className="text-2xl font-bold text-gray-900">{tutorStats.resourcesShared}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FileTextIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-orange-600">{tutorStats.pendingRequests}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <MessageSquareIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-lg font-semibold text-green-600">+12% growth</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Today's Teaching Schedule</h3>
            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1">
              <PlusIcon className="h-4 w-4" />
              <span>New Session</span>
            </button>
          </div>
          {tutorStats.upcomingSessions > 0 ? (
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: 'Data Structures Deep Dive',
                  date: 'Today, 4:00 PM - 5:30 PM',
                  course: 'CS201',
                  attendees: 18,
                  type: 'group-session'
                },
                {
                  id: 2,
                  title: 'One-on-One: Calculus Help',
                  date: 'Today, 6:00 PM - 7:00 PM',
                  course: 'MATH102',
                  attendees: 1,
                  type: 'individual'
                },
                {
                  id: 3,
                  title: 'Programming Concepts Review',
                  date: 'Tomorrow, 3:30 PM - 4:30 PM',
                  course: 'CS101',
                  attendees: 15,
                  type: 'group-session'
                },
              ].map((session) => (
                <div key={session.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${
                      session.type === 'individual' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {session.type === 'individual' ? <MessageSquareIcon className="h-4 w-4" /> : <UsersIcon className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="text-sm font-medium text-gray-900">{session.title}</p>
                    <p className="text-sm text-gray-500">
                      {session.date} • {session.course} • {session.attendees} {session.attendees === 1 ? 'student' : 'students'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      <PlayIcon className="h-3 w-3 inline mr-1" />
                      Start
                    </button>
                    <button className="px-3 py-1 text-sm border text-gray-600 rounded hover:bg-gray-50">
                      <SettingsIcon className="h-3 w-3 inline mr-1" />
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No sessions scheduled for today</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Schedule Your First Session
              </button>
            </div>
          )}
        </div>

        {/* Course Management Sidebar */}
        <div className="space-y-6">
          {/* Your Courses */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Your Courses</h3>
            <div className="space-y-3">
              {[
                { id: 1, name: 'Computer Science Fundamentals', code: 'CS101', students: 25, completion: 78 },
                { id: 2, name: 'Data Structures & Algorithms', code: 'CS201', students: 18, completion: 65 },
                { id: 3, name: 'Advanced Calculus', code: 'MATH102', students: 24, completion: 82 }
              ].map((course) => (
                <div key={course.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.code} • {course.students} students</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{course.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${course.completion}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create New Course</span>
            </button>
          </div>

          {/* Recent Student Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'New student enrollment', course: 'CS101', time: '2 hours ago', type: 'enrollment' },
                { action: 'Assignment submitted', course: 'CS201', time: '5 hours ago', type: 'submission' },
                { action: 'Question posted in forum', course: 'MATH102', time: '1 day ago', type: 'question' },
                { action: 'Session completed', course: 'CS101', time: '2 days ago', type: 'session' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'enrollment' ? 'bg-green-400' :
                    activity.type === 'submission' ? 'bg-blue-400' :
                    activity.type === 'question' ? 'bg-yellow-400' : 'bg-purple-400'
                  }`}></div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.course} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorDashboard
