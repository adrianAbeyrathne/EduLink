import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  UsersIcon,
  BookIcon,
  ShieldIcon,
  AlertCircleIcon,
  UserPlusIcon,
  UserCheckIcon,
  SettingsIcon,
  DatabaseIcon,
  BarChart3Icon,
  XIcon,
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
  TrashIcon,
  FilterIcon,
  DownloadIcon
} from 'lucide-react'

const AdminDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1248,
    activeStudents: 856,
    activeTutors: 142,
    totalCourses: 32,
    activeSessions: 18,
    pendingVerifications: 8,
    systemReports: 3,
    monthlyGrowth: 12.5,
    serverUptime: '99.8%',
    avgSessionDuration: '45 min'
  })

  const [activeModal, setActiveModal] = useState(null)
  const [chartData, setChartData] = useState({
    userGrowth: [320, 445, 590, 712, 856, 984, 1248],
    sessionData: [12, 15, 22, 18, 25, 19, 18],
    completionRates: [78, 82, 85, 79, 88, 91, 87]
  })

  const [recentActivity] = useState([
    { id: 1, user: 'Sarah Johnson', action: 'Student registration', time: '5 min ago', status: 'completed', type: 'success' },
    { id: 2, user: 'Michael Chen', action: 'Tutor verification request', time: '12 min ago', status: 'pending', type: 'warning' },
    { id: 3, user: 'Emily Rodriguez', action: 'Password reset', time: '25 min ago', status: 'completed', type: 'success' },
    { id: 4, user: 'David Kim', action: 'Course completion', time: '1 hour ago', status: 'completed', type: 'success' },
    { id: 5, user: 'Anonymous', action: 'System report submitted', time: '2 hours ago', status: 'under review', type: 'error' },
  ])

  const [systemHealth] = useState([
    { component: 'Database', status: 'online', uptime: '99.9%', color: 'green' },
    { component: 'API Server', status: 'online', uptime: '99.8%', color: 'green' },
    { component: 'File Storage', status: 'online', uptime: '99.7%', color: 'green' },
    { component: 'Authentication', status: 'warning', uptime: '98.2%', color: 'yellow' },
    { component: 'Email Service', status: 'online', uptime: '99.5%', color: 'green' }
  ])

  // Mock user management data
  const [users] = useState([
    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'student', status: 'active', joinDate: '2024-03-15' },
    { id: 2, name: 'Michael Chen', email: 'michael@example.com', role: 'tutor', status: 'pending', joinDate: '2024-03-20' },
    { id: 3, name: 'Emily Rodriguez', email: 'emily@example.com', role: 'student', status: 'active', joinDate: '2024-03-18' },
    { id: 4, name: 'David Kim', email: 'david@example.com', role: 'tutor', status: 'active', joinDate: '2024-03-10' },
  ])

  // Mock course management data
  const [courses] = useState([
    { id: 1, title: 'Advanced Mathematics', instructor: 'Dr. Smith', students: 45, status: 'active', created: '2024-02-01' },
    { id: 2, title: 'Physics Fundamentals', instructor: 'Prof. Johnson', students: 32, status: 'active', created: '2024-02-15' },
    { id: 3, title: 'Computer Science Basics', instructor: 'Mr. Williams', students: 28, status: 'draft', created: '2024-03-01' },
    { id: 4, title: 'Chemistry Lab', instructor: 'Dr. Brown', students: 20, status: 'active', created: '2024-01-20' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeSessions: Math.floor(Math.random() * 25) + 15,
        serverUptime: (99.5 + Math.random() * 0.5).toFixed(1) + '%'
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleCardClick = (modalType) => {
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const handleUserAction = (userId, action) => {
    console.log(`${action} user ${userId}`)
    // In real app, make API call
  }

  const handleCourseAction = (courseId, action) => {
    console.log(`${action} course ${courseId}`)
    // In real app, make API call
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">EduLink Administration Dashboard</h2>
        <p className="text-indigo-100">System overview and management controls for EduLink platform</p>
      </div>

      {/* Key Metrics - Now Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="bg-white shadow rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('users')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-800">{systemStats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">+{systemStats.monthlyGrowth}% this month</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white shadow rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('courses')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <BookIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-2xl font-semibold text-gray-800">{systemStats.totalCourses}</p>
              <p className="text-xs text-blue-600">{systemStats.activeSessions} live sessions</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white shadow rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('tutors')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <UserCheckIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Tutors</p>
              <p className="text-2xl font-semibold text-gray-800">{systemStats.activeTutors}</p>
              <p className="text-xs text-yellow-600">{systemStats.pendingVerifications} pending verification</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white shadow rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleCardClick('reports')}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertCircleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">System Alerts</p>
              <p className="text-2xl font-semibold text-gray-800">{systemStats.systemReports}</p>
              <p className="text-xs text-red-600">Requires attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Activity Feed - Now takes 3 columns */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent System Activity</h3>
            <div className="flex space-x-2">
              <button className="text-sm text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md">
                Real-time
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700 bg-gray-50 px-3 py-1 rounded-md">
                Export
              </button>
            </div>
          </div>
          
          {/* Activity Table */}
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{activity.action}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.type === 'success' ? 'bg-green-100 text-green-800' :
                        activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-3">
                        View
                      </button>
                      {activity.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Integrated Analytics in the Activity Section */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Weekly Activity Trends</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{chartData.sessionData.reduce((a, b) => a + b, 0)}</div>
                <div className="text-sm text-gray-600">Total Sessions This Week</div>
                <div className="text-xs text-green-600">+{Math.round((chartData.sessionData[6] / chartData.sessionData[0]) * 100 - 100)}% vs last week</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{chartData.completionRates[chartData.completionRates.length - 1]}%</div>
                <div className="text-sm text-gray-600">Current Completion Rate</div>
                <div className="text-xs text-blue-600">Industry avg: 75%</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(chartData.userGrowth[chartData.userGrowth.length - 1] / 7)}</div>
                <div className="text-sm text-gray-600">Daily New Users</div>
                <div className="text-xs text-orange-600">7-day average</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Now 1 column */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
            <div className="space-y-3">
              {systemHealth.map((component, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  component.color === 'green' ? 'bg-green-50' : 
                  component.color === 'yellow' ? 'bg-yellow-50' : 
                  'bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DatabaseIcon className={`h-4 w-4 mr-2 ${
                        component.color === 'green' ? 'text-green-600' : 
                        component.color === 'yellow' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`} />
                      <span className="text-sm font-medium">{component.component}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${
                        component.color === 'green' ? 'text-green-800' : 
                        component.color === 'yellow' ? 'text-yellow-800' : 
                        'text-red-800'
                      }`}>
                        {component.status}
                      </div>
                      <div className="text-xs text-gray-500">{component.uptime}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions - Made More Logical */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Tools</h3>
            <div className="space-y-3">
              <button 
                className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
                onClick={() => handleCardClick('maintenance')}
              >
                <div className="flex items-center">
                  <SettingsIcon className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-orange-800">System Maintenance</p>
                    <p className="text-xs text-orange-600">Scheduled tasks & backups</p>
                  </div>
                </div>
              </button>

              <button 
                className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                onClick={() => handleCardClick('security')}
              >
                <div className="flex items-center">
                  <ShieldIcon className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <p className="font-medium text-indigo-800">Security Center</p>
                    <p className="text-xs text-indigo-600">Monitor threats & access</p>
                  </div>
                </div>
              </button>

              <button 
                className="w-full text-left p-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors group"
                onClick={() => handleCardClick('backup')}
              >
                <div className="flex items-center">
                  <DatabaseIcon className="h-5 w-5 text-teal-600 mr-3" />
                  <div>
                    <p className="font-medium text-teal-800">Backup Management</p>
                    <p className="text-xs text-teal-600">Data backup & recovery</p>
                  </div>
                </div>
              </button>

              <button 
                className="w-full text-left p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
                onClick={() => handleCardClick('logs')}
              >
                <div className="flex items-center">
                  <EyeIcon className="h-5 w-5 text-pink-600 mr-3" />
                  <div>
                    <p className="font-medium text-pink-800">System Logs</p>
                    <p className="text-xs text-pink-600">Error tracking & debugging</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - Enhanced */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">System Performance & Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600">{systemStats.serverUptime}</div>
            <div className="text-sm text-gray-600 font-medium">Server Uptime</div>
            <div className="text-xs text-green-600 mt-1">Excellent</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{systemStats.activeStudents}</div>
            <div className="text-sm text-gray-600 font-medium">Active Students</div>
            <div className="text-xs text-blue-600 mt-1">+{systemStats.monthlyGrowth}% growth</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{systemStats.activeSessions}</div>
            <div className="text-sm text-gray-600 font-medium">Live Sessions</div>
            <div className="text-xs text-purple-600 mt-1">Real-time</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{systemStats.avgSessionDuration}</div>
            <div className="text-sm text-gray-600 font-medium">Avg Session Time</div>
            <div className="text-xs text-orange-600 mt-1">Above average</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">4.8/5</div>
            <div className="text-sm text-gray-600 font-medium">User Satisfaction</div>
            <div className="text-xs text-green-600 mt-1">Excellent rating</div>
          </div>
        </div>
      </div>

      {/* Modal Windows for Each Admin Function */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {activeModal === 'users' && 'User Management'}
                {activeModal === 'courses' && 'Course Management'}
                {activeModal === 'tutors' && 'Tutor Verifications'}
                {activeModal === 'reports' && 'System Reports'}
                {activeModal === 'analytics' && 'System Analytics'}
                {activeModal === 'settings' && 'System Settings'}
                {activeModal === 'maintenance' && 'System Maintenance'}
                {activeModal === 'security' && 'Security Center'}
                {activeModal === 'backup' && 'Backup Management'}
                {activeModal === 'logs' && 'System Logs'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {activeModal === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center">
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      Add User
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center">
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center">
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'tutor' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' :
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.joinDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => handleUserAction(user.id, 'view')}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleUserAction(user.id, 'edit')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            {user.status === 'pending' && (
                              <button 
                                onClick={() => handleUserAction(user.id, 'approve')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeModal === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 flex items-center">
                      <BookIcon className="h-4 w-4 mr-2" />
                      Add Course
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center">
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.instructor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.students}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              course.status === 'active' ? 'bg-green-100 text-green-800' :
                              course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {course.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.created}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => handleCourseAction(course.id, 'view')}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleCourseAction(course.id, 'edit')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleCourseAction(course.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeModal === 'tutors' && (
              <div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Pending Verifications ({systemStats.pendingVerifications})</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Michael Chen</p>
                        <p className="text-sm text-gray-600">Subject: Mathematics & Physics</p>
                        <p className="text-sm text-gray-600">Experience: 5 years</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                          Approve
                        </button>
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'reports' && (
              <div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">System Reports ({systemStats.systemReports})</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">High Memory Usage Alert</p>
                        <p className="text-sm text-gray-600">Server memory usage at 89%</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Investigate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">User Analytics</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{systemStats.totalUsers.toLocaleString()}</div>
                    <div className="text-sm text-blue-600">Total Registered Users</div>
                    <div className="text-xs text-gray-600 mt-2">+{systemStats.monthlyGrowth}% this month</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Session Analytics</h4>
                    <div className="text-2xl font-bold text-green-600 mb-1">{chartData.sessionData.reduce((a, b) => a + b, 0)}</div>
                    <div className="text-sm text-green-600">Sessions This Week</div>
                    <div className="text-xs text-gray-600 mt-2">Avg: {Math.round(chartData.sessionData.reduce((a, b) => a + b, 0) / 7)} per day</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Performance</h4>
                    <div className="text-2xl font-bold text-purple-600 mb-1">{chartData.completionRates[chartData.completionRates.length - 1]}%</div>
                    <div className="text-sm text-purple-600">Completion Rate</div>
                    <div className="text-xs text-gray-600 mt-2">Above industry average</div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'maintenance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Scheduled Maintenance</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-blue-800">Database Cleanup</p>
                            <p className="text-xs text-blue-600">Next: Tomorrow 2:00 AM</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Configure</button>
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-green-800">System Backup</p>
                            <p className="text-xs text-green-600">Next: Daily 12:00 AM</p>
                          </div>
                          <button className="text-green-600 hover:text-green-800 text-sm">Configure</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Last Maintenance</span>
                        <span className="text-green-600">2 days ago</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Next Scheduled</span>
                        <span className="text-blue-600">Tomorrow 2:00 AM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Maintenance Window</span>
                        <span className="text-gray-600">2:00-4:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'security' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Security Alerts</h4>
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-red-600">Failed login attempts</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Pending Reviews</h4>
                    <div className="text-2xl font-bold text-yellow-600">{systemStats.pendingVerifications}</div>
                    <div className="text-sm text-yellow-600">User verifications</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Recent Security Events</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded border-l-4 border-red-500">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Multiple failed login attempts</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <span className="text-xs text-gray-600">IP: 192.168.1.100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'backup' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">Daily</div>
                    <div className="text-sm text-green-600">Automatic Backup</div>
                    <div className="text-xs text-gray-600 mt-1">Last: 6 hours ago</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">2.4 GB</div>
                    <div className="text-sm text-blue-600">Backup Size</div>
                    <div className="text-xs text-gray-600 mt-1">Compressed</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">30 days</div>
                    <div className="text-sm text-purple-600">Retention Period</div>
                    <div className="text-xs text-gray-600 mt-1">Configurable</div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Create Backup Now
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Restore from Backup
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                    Configure Schedule
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'logs' && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">All</button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">Errors</button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">Warnings</button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm">Info</button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-red-800">Database connection timeout</span>
                      <span className="text-xs text-gray-500">2025-09-28 09:45:32</span>
                    </div>
                    <span className="text-xs text-red-600">Connection pool exhausted</span>
                  </div>
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-yellow-800">High memory usage detected</span>
                      <span className="text-xs text-gray-500">2025-09-28 09:30:15</span>
                    </div>
                    <span className="text-xs text-yellow-600">Memory usage: 89%</span>
                  </div>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-blue-800">User authentication success</span>
                      <span className="text-xs text-gray-500">2025-09-28 09:25:42</span>
                    </div>
                    <span className="text-xs text-blue-600">User: admin@edulink.com</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">System Configuration</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm">Maintenance Mode</span>
                        <input type="checkbox" className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm">Auto Backups</span>
                        <input type="checkbox" checked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm">Email Notifications</span>
                        <input type="checkbox" checked className="toggle" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Performance Settings</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded">
                        <label className="block text-sm mb-1">Max Sessions</label>
                        <input type="number" defaultValue="50" className="w-full text-sm border rounded px-2 py-1" />
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <label className="block text-sm mb-1">Session Timeout (min)</label>
                        <input type="number" defaultValue="30" className="w-full text-sm border rounded px-2 py-1" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard