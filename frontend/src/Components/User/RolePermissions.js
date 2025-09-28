import React, { useState } from 'react'
import { ShieldIcon, CheckIcon, XIcon } from 'lucide-react'

const RolePermissions = () => {
  const [permissions, setPermissions] = useState([
    {
      id: 'view_dashboard',
      name: 'View Dashboard',
      description: 'Access to view the main dashboard',
      student: true,
      tutor: true,
      admin: true,
    },
    {
      id: 'join_sessions',
      name: 'Join Sessions',
      description: 'Ability to join study sessions',
      student: true,
      tutor: true,
      admin: true,
    },
    {
      id: 'create_sessions',
      name: 'Create Sessions',
      description: 'Create new study sessions',
      student: false,
      tutor: true,
      admin: true,
    },
    {
      id: 'manage_sessions',
      name: 'Manage Sessions',
      description: 'Edit or delete any study sessions',
      student: false,
      tutor: false,
      admin: true,
    },
    {
      id: 'upload_resources',
      name: 'Upload Resources',
      description: 'Upload study materials and resources',
      student: false,
      tutor: true,
      admin: true,
    },
    {
      id: 'manage_users',
      name: 'Manage Users',
      description: 'Create, edit, or delete user accounts',
      student: false,
      tutor: false,
      admin: true,
    },
    {
      id: 'verify_tutors',
      name: 'Verify Tutors',
      description: 'Approve or reject tutor verification requests',
      student: false,
      tutor: false,
      admin: true,
    },
  ])

  const [activeRole, setActiveRole] = useState('student')

  const togglePermission = (permissionId, role) => {
    setPermissions(
      permissions.map((permission) =>
        permission.id === permissionId
          ? { ...permission, [role]: !permission[role] }
          : permission,
      ),
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Role Permissions</h2>
        <div className="flex bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setActiveRole('student')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeRole === 'student'
                ? 'bg-white shadow text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setActiveRole('tutor')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeRole === 'tutor'
                ? 'bg-white shadow text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tutor
          </button>
          <button
            onClick={() => setActiveRole('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeRole === 'admin'
                ? 'bg-white shadow text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
        <ShieldIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Permissions define what actions each user role can perform in the system. Admin users can modify these permissions. Changes will affect all users with the selected role.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutor
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permissions.map((permission) => (
              <tr
                key={permission.id}
                className={`hover:bg-gray-50 ${
                  permission.id === 'manage_users' ? 'bg-gray-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {permission.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{permission.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => togglePermission(permission.id, 'student')}
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      permission.student
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    disabled={activeRole !== 'admin'}
                  >
                    {permission.student ? <CheckIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => togglePermission(permission.id, 'tutor')}
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      permission.tutor
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    disabled={activeRole !== 'admin'}
                  >
                    {permission.tutor ? <CheckIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600" disabled>
                    <CheckIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={activeRole !== 'admin'}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default RolePermissions
