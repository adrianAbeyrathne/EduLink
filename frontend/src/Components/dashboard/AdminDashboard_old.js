import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  UsersIcon,
  BookIcon,
  ShieldIcon,
  AlertCircleIcon,
  UserPlusIcon,
  UserCheckIcon,
  TrendingUpIcon,
  SettingsIcon,
  DatabaseIcon,
  CheckCircleIcon,
  PlayIcon,
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [isNewAdmin, setIsNewAdmin] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    pendingVerifications: 0,
    reports: 0,
    newUsers: 0,
    verifiedTutors: 0
  })

  useEffect(() => {
    if (user) {
      // Consider admin as new if created within last 14 days or has minimal system interaction
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const createdAt = new Date(user.createdAt)
      
      // New admin criteria
      const isRecentAdmin = createdAt > twoWeeksAgo
      const hasMinimalAdminProfile = !user.experience || user.experience.length < 10
      
      setIsNewAdmin(isRecentAdmin || hasMinimalAdminProfile)
      
      // Mock stats - in real app, these would come from API
      setSystemStats({
        totalUsers: isRecentAdmin ? 15 : 1248,
        activeCourses: isRecentAdmin ? 3 : 32,
        pendingVerifications: isRecentAdmin ? 2 : 8,
        reports: isRecentAdmin ? 0 : 3,
        newUsers: isRecentAdmin ? 5 : 24,
        verifiedTutors: isRecentAdmin ? 1 : 18
      })
    }
  }, [user])

  if (isNewAdmin) {
    return (
      <div className="flex flex-col space-y-8">
        {/* Welcome Section for New Admins */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard, {user?.name}! 🛡️</h2>
          <p className="text-purple-100 mb-6">You have administrative privileges. Let's get you familiar with the system management tools.</p>
        </div>

        {/* Admin Setup Checklist */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Admin Setup Checklist</h3>
          <div className="space-y-4">
            {[
              {
                title: "Complete Admin Profile",
                description: "Set up your administrative profile with contact details and responsibilities",
                completed: user?.phone && user?.location && user?.experience,
                action: "Complete Profile",
                link: "/profile"
              },
              {
                title: "Review System Users",
                description: "Browse existing users and understand the current user base",
                completed: false,
                action: "View Users",
                link: "/admin/users"
              },
              {
                title: "Check Pending Verifications",
                description: "Review and process any pending tutor verifications",
                completed: systemStats.pendingVerifications === 0,
                action: "Review Verifications",
                link: "/admin/verifications"
              },
              {
                title: "Configure System Settings",
                description: "Set up system preferences and administrative policies",
                completed: false,
                action: "System Settings",
                link: "/admin/settings"
              }
            ].map((step, index) => (
              <div key={index} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {step.completed ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                <button className="ml-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <span>{step.action}</span>
                  <PlayIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions for New Admins */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-500 mb-4">View and manage all system users, their roles, and permissions</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Manage Users
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security Center</h3>
            <p className="text-sm text-gray-500 mb-4">Monitor system security, user activities, and access logs</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Security Dashboard
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Config</h3>
            <p className="text-sm text-gray-500 mb-4">Configure system settings, policies, and administrative preferences</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Settings
            </button>
          </div>
        </div>

        {/* Basic Stats for New Admin */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
                <UsersIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-lg font-semibold text-gray-800">{systemStats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <BookIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Courses</p>
                <p className="text-lg font-semibold text-gray-800">{systemStats.activeCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <ShieldIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                <p className="text-lg font-semibold text-gray-800">{systemStats.pendingVerifications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-500">
                <AlertCircleIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Reports</p>
                <p className="text-lg font-semibold text-gray-800">{systemStats.reports}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-8">
      {/* Advanced Stats for Experienced Admins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-lg font-semibold text-gray-800">{systemStats.totalUsers}</p>
              <p className="text-xs text-green-600">+5% this month</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <BookIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-lg font-semibold text-gray-800">{systemStats.activeCourses}</p>
              <p className="text-xs text-green-600">+3 new courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <ShieldIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
              <p className="text-lg font-semibold text-gray-800">{systemStats.pendingVerifications}</p>
              <p className="text-xs text-yellow-600">Requires attention</p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-500">
              <AlertCircleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Reports</p>
              <p className="text-lg font-semibold text-gray-800">{systemStats.reports}</p>
              <p className="text-xs text-red-600">Urgent review needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">System Activity Dashboard</h3>
            <div className="flex space-x-2">
              <button className="text-sm text-indigo-600 hover:text-indigo-900">Real-time</button>
              <button className="text-sm text-gray-500 hover:text-gray-700">Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { id: 1, user: 'Sarah Johnson', action: 'Account created', time: '2 min ago', status: 'Completed', type: 'success' },
                  { id: 2, user: 'John Smith', action: 'Tutor verification', time: '1 hour ago', status: 'Pending', type: 'warning' },
                  { id: 3, user: 'Michael Chen', action: 'Password reset', time: '2 hours ago', status: 'Completed', type: 'success' },
                  { id: 4, user: 'Emily Davis', action: 'Profile updated', time: '3 hours ago', status: 'Completed', type: 'success' },
                  { id: 5, user: 'David Wilson', action: 'Report submitted', time: '1 day ago', status: 'Under Review', type: 'error' },
                ].map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{activity.action}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activity.type === 'success' ? 'bg-green-100 text-green-800' :
                        activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                      {activity.status === 'Pending' && (
                        <button className="text-green-600 hover:text-green-900">Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <DatabaseIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-xs font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <span className="text-xs font-medium text-green-600">Excellent</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <ShieldIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">Security</span>
                </div>
                <span className="text-xs font-medium text-yellow-600">1 Alert</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                <div className="flex items-center">
                  <UserPlusIcon className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">New Users: {systemStats.newUsers}</p>
                    <p className="text-xs">Review and welcome</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex items-center">
                  <UserCheckIcon className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Pending Verifications: {systemStats.pendingVerifications}</p>
                    <p className="text-xs">Process tutor applications</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center">
                  <AlertCircleIcon className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Reports: {systemStats.reports}</p>
                    <p className="text-xs">Review user reports</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced System Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">System Analytics & Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">98.5%</div>
            <div className="text-sm text-gray-500">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4.8/5</div>
            <div className="text-sm text-gray-500">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1.2k</div>
            <div className="text-sm text-gray-500">Active Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">52ms</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
