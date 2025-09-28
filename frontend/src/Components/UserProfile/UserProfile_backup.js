import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Book, Clock, Award, Settings, Camera, Trash2 } from 'lucide-react';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    role: '',
    bio: '',
    university: '',
    degree: '',
    modules: [],
    userStatus: 'Available',
    preferences: {
      emailNotifications: true,
      studyReminders: true
    }
  });
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [profilePicTimestamp, setProfilePicTimestamp] = useState(Date.now());
  const fileInputRef = useRef(null);

  // Check if user is new (has minimal data)
  const isNewUser = !user?.bio && !user?.university && !user?.school && 
                    (!user?.modules || user?.modules?.length === 0) && 
                    (!user?.subjects || user?.subjects?.length === 0) &&
                    !user?.profilePic;

  // Mock data for existing users
  const [recentActivity, setRecentActivity] = useState(
    isNewUser ? [] : [
      { id: 1, action: 'Completed Database Systems Quiz', date: '2024-01-15', type: 'quiz', module: 'Database Systems' },
      { id: 2, action: 'Participated in Web Development Discussion', date: '2024-01-14', type: 'discussion', module: 'Web Development' },
      { id: 3, action: 'Attended Software Engineering Online Session', date: '2024-01-13', type: 'session', module: 'Software Engineering' },
      { id: 4, action: 'Practiced Algorithms Past Papers', date: '2024-01-12', type: 'pastpaper', module: 'Data Structures & Algorithms' },
      { id: 5, action: 'Updated Learning Notes', date: '2024-01-12', type: 'profile', module: null }
    ]
  );

  const [courseProgress, setCourseProgress] = useState(
    isNewUser ? [] : [
      { id: 1, module: 'Database Systems', progress: 85, sessions: 12, attended: 10, quizzes: 8, completed: 7, discussions: 15, participated: 12, nextSession: '2024-02-01' },
      { id: 2, module: 'Web Development', progress: 92, sessions: 10, attended: 10, quizzes: 6, completed: 6, discussions: 20, participated: 18, nextSession: '2024-02-05' },
      { id: 3, module: 'Software Engineering', progress: 76, sessions: 14, attended: 11, quizzes: 10, completed: 7, discussions: 12, participated: 9, nextSession: '2024-01-28' },
      { id: 4, module: 'Data Structures & Algorithms', progress: 68, sessions: 16, attended: 12, quizzes: 12, completed: 8, discussions: 18, participated: 14, nextSession: '2024-02-10' }
    ]
  );

  // Role-specific mock data functions
  const getTutorData = () => {
    if (isNewUser) {
      return { recentActivity: [], moduleStats: [] };
    }
    return {
      recentActivity: [
        { id: 1, action: 'Conducted Database Systems Session', date: '2024-01-15', type: 'session', module: 'Database Systems' },
        { id: 2, action: 'Graded Web Development Quizzes', date: '2024-01-14', type: 'grading', module: 'Web Development' },
        { id: 3, action: 'Led Software Engineering Discussion', date: '2024-01-13', type: 'discussion', module: 'Software Engineering' }
      ],
      moduleStats: [
        { id: 1, module: 'Database Systems', students: 45, sessionsCompleted: 10, totalSessions: 12, avgScore: 87, nextSession: '2024-02-01' },
        { id: 2, module: 'Web Development', students: 38, sessionsCompleted: 8, totalSessions: 10, avgScore: 91, nextSession: '2024-02-05' }
      ]
    };
  };

  const getAdminData = () => {
    if (isNewUser) {
      return {
        recentActivity: [],
        systemStats: [
          { label: 'Total Students', value: 0, change: 'New Admin', color: 'blue' },
          { label: 'Active Tutors', value: 0, change: 'Getting Started', color: 'green' },
          { label: 'Online Sessions Today', value: 0, change: 'No Data Yet', color: 'purple' },
          { label: 'System Health', value: 'Good', change: 'Monitoring', color: 'green' }
        ]
      };
    }
    return {
      recentActivity: [
        { id: 1, action: 'System Maintenance Completed', date: '2024-01-15', type: 'system', module: null },
        { id: 2, action: 'Added New Tutor Account', date: '2024-01-14', type: 'user', module: null },
        { id: 3, action: 'Updated System Settings', date: '2024-01-13', type: 'settings', module: null }
      ],
      systemStats: [
        { label: 'Total Students', value: 1247, change: '+12%', color: 'blue' },
        { label: 'Active Tutors', value: 23, change: '+2', color: 'green' },
        { label: 'Online Sessions Today', value: 34, change: '+8', color: 'purple' },
        { label: 'System Uptime', value: '99.8%', change: '+0.2%', color: 'green' }
      ]
    };
  };

  // Get role-specific data
  const roleData = user?.role === 'tutor' ? getTutorData() : 
                   user?.role === 'admin' ? getAdminData() : 
                   { recentActivity, courseProgress };

  const moduleOptions = [
    'Database Systems', 'Software Engineering', 'Computer Networks', 'Web Development',
    'Data Structures & Algorithms', 'Operating Systems', 'Cybersecurity', 'Machine Learning',
    'Artificial Intelligence', 'Mobile App Development', 'Cloud Computing', 'DevOps',
    'Human-Computer Interaction', 'Information Systems', 'Project Management', 'Data Analytics'
  ];

  useEffect(() => {
    if (user) {
      setFormData(prev => {
        // Only update if this is the initial load or if the user status actually changed in the backend
        const shouldUpdateStatus = !prev.userStatus || prev.userStatus === 'Available' || user.userStatus !== prev.userStatus;
        
        return {
          name: user.name || '',
          email: user.email || '',
          age: user.age || '',
          role: user.role || '',
          bio: user.bio || '',
          university: user.university || user.school || '',
          degree: user.degree || user.grade || '',
          modules: user.modules || user.subjects || [],
          userStatus: shouldUpdateStatus ? (user.userStatus || 'Available') : prev.userStatus,
          preferences: {
            emailNotifications: user.preferences?.emailNotifications ?? true,
            studyReminders: user.preferences?.studyReminders ?? true,
            assignmentReminders: user.preferences?.assignmentReminders ?? true,
            discussionUpdates: user.preferences?.discussionUpdates ?? true,
            
            // Student Learning Preferences
            preferredStudyTime: user.preferences?.preferredStudyTime || 'morning',
            learningStyle: user.preferences?.learningStyle || 'visual',
            sessionDuration: user.preferences?.sessionDuration || '60min',
            weeklyStudyGoal: user.preferences?.weeklyStudyGoal || '10',
            autoEnroll: user.preferences?.autoEnroll ?? false,
            studyStreakTracking: user.preferences?.studyStreakTracking ?? true,
            showDifficultyLevels: user.preferences?.showDifficultyLevels ?? true,
            preferredHelpMethod: user.preferences?.preferredHelpMethod || 'forum',
            autoJoinStudyGroups: user.preferences?.autoJoinStudyGroups ?? false,
            receivePeerInvites: user.preferences?.receivePeerInvites ?? true,
            enableAIAssistant: user.preferences?.enableAIAssistant ?? true,
            
            // Tutor Teaching Preferences
            preferredTeachingHours: user.preferences?.preferredTeachingHours || 'flexible',
            maxStudentsPerSession: user.preferences?.maxStudentsPerSession || '20',
            sessionBreakDuration: user.preferences?.sessionBreakDuration || '15min',
            autoAcceptStudents: user.preferences?.autoAcceptStudents ?? false,
            allowLateSubmissions: user.preferences?.allowLateSubmissions ?? true,
            gradeReleasePolicy: user.preferences?.gradeReleasePolicy || 'immediate',
            responseTimeGoal: user.preferences?.responseTimeGoal || '24h',
            feedbackReminders: user.preferences?.feedbackReminders ?? true,
            enableOfficeHours: user.preferences?.enableOfficeHours ?? true,
            
            // Admin System Preferences
            autoApproveTutors: user.preferences?.autoApproveTutors ?? false,
            enableBulkOperations: user.preferences?.enableBulkOperations ?? false,
            maintenanceWindow: user.preferences?.maintenanceWindow || '2am-4am',
            dashboardRefreshRate: user.preferences?.dashboardRefreshRate || '30s',
            realTimeTracking: user.preferences?.realTimeTracking ?? true,
            weeklyReports: user.preferences?.weeklyReports ?? true,
            loginAttemptThreshold: user.preferences?.loginAttemptThreshold || '5',
            force2FA: user.preferences?.force2FA ?? false,
            auditLogging: user.preferences?.auditLogging ?? true,
            systemAlerts: user.preferences?.systemAlerts ?? true,
            userRegistrationAlerts: user.preferences?.userRegistrationAlerts ?? true,
            
            // Privacy & Security
            publicProfile: user.preferences?.publicProfile ?? true,
            allowDirectMessages: user.preferences?.allowDirectMessages ?? true,
            shareProgressWithTutors: user.preferences?.shareProgressWithTutors ?? true
          }
        };
      });
    }
  }, [user]);

  // Professional color schemes
  const roleThemes = {
    student: {
      primary: '#4F46E5',
      secondary: '#3B82F6',
      gradient: 'from-indigo-600 to-blue-500',
      bgColor: '#F8FAFC',
      accent: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      textPrimary: 'text-indigo-600',
      borderColor: 'border-indigo-100'
    },
    tutor: {
      primary: '#059669',
      secondary: '#10B981',
      gradient: 'from-emerald-600 to-green-500',
      bgColor: '#F0FDF4',
      accent: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      textPrimary: 'text-emerald-600',
      borderColor: 'border-emerald-100'
    },
    admin: {
      primary: '#DC2626',
      secondary: '#F59E0B',
      gradient: 'from-red-600 to-orange-500',
      bgColor: '#FFFBEB',
      accent: 'bg-red-50 text-red-700 border border-red-200',
      primaryBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      textPrimary: 'text-red-600',
      borderColor: 'border-red-100'
    }
  };

  const theme = roleThemes[user?.role] || roleThemes.student;

  // Event Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleModuleChange = (module) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module]
    }));
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      // Update local state immediately for better UX
      setFormData(prev => ({ ...prev, userStatus: newStatus }));
      
      const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, {
        userStatus: newStatus
      });
      
      if (response.status === 200) {
        toast.success(`Status updated to ${newStatus}`);
        // Update the user context with the new status
        const updatedUserData = response.data.users || response.data.user;
        updateUser(updatedUserData);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      // Revert local state on error
      setFormData(prev => ({ ...prev, userStatus: user.userStatus || 'Available' }));
    }
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    const ageNumber = parseInt(formData.age);
    if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 150) {
      toast.error('Age must be between 1 and 150');
      return;
    }

    setLoading(true);
    
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        age: ageNumber,
        bio: formData.bio,
        university: formData.university,
        degree: formData.degree,
        modules: formData.modules,
        userStatus: formData.userStatus,
        preferences: formData.preferences
      };

      const response = await axios.put(`http://localhost:5000/api/users/${user._id}`, updateData);

      if (response.status === 200) {
        toast.success('Profile updated successfully!');
        updateUser(response.data.users || response.data.user);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    if (!profilePic) {
      toast.error('Please select a profile picture');
      return;
    }

    setUploadingPic(true);
    const uploadFormData = new FormData();
    uploadFormData.append('profilePic', profilePic);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/${user._id}/profile-pic`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      toast.success('Profile picture updated successfully!');
      updateUser(response.data.user);
      setProfilePicTimestamp(Date.now());
      setProfilePic(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleProfilePicDelete = async () => {
    if (!user.profilePic) {
      toast.error('No profile picture to remove');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmed) return;

    setUploadingPic(true);

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/users/${user._id}/profile-pic`
      );
      
      toast.success('Profile picture removed successfully!');
      updateUser(response.data.user);
      setProfilePicTimestamp(Date.now());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove profile picture');
    } finally {
      setUploadingPic(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header Banner */}
      <div className={`bg-gradient-to-r ${theme.gradient} h-32 relative`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </div>
      
      <div className="container mx-auto px-6 -mt-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            {/* Professional Profile Header */}
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  {/* Profile Picture */}
                  <div className="relative group">
                    {user.profilePic ? (
                      <img
                        src={`http://localhost:5000${user.profilePic}?v=${profilePicTimestamp}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center ring-4 ring-white shadow-lg`}>
                        <span className="text-white text-2xl font-semibold">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                    
                    {/* Camera Icon */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPic}
                      className={`absolute bottom-0 right-0 w-8 h-8 rounded-full ${theme.primaryBtn} text-white shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center z-10`}
                      title="Change photo"
                    >
                      <Camera size={14} />
                    </button>
                    
                    {/* Delete Button */}
                    {user.profilePic && (
                      <button 
                        onClick={handleProfilePicDelete}
                        disabled={uploadingPic}
                        className="absolute top-0 right-0 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center z-10"
                        title="Remove photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme.accent}`}>
                        <User size={16} className="mr-1" />
                        {user.role === 'student' ? 'Student' : 
                         user.role === 'tutor' ? 'Tutor' : 
                         'Administrator'}
                      </div>
                      {user.university && (
                        <div className="flex items-center text-gray-600">
                          <Book size={16} className="mr-1" />
                          <span className="text-sm">{user.university}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Mail size={16} className="mr-2" />
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="text-right">
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium mb-3 ${
                    formData.userStatus === 'Available' ? 'bg-green-50 text-green-800 border-green-200' :
                    formData.userStatus === 'Away' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                    formData.userStatus === 'Busy' ? 'bg-red-50 text-red-800 border-red-200' :
                    formData.userStatus === 'Do Not Disturb' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                    'bg-gray-50 text-gray-800 border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      formData.userStatus === 'Available' ? 'bg-green-400' :
                      formData.userStatus === 'Away' ? 'bg-yellow-400' :
                      formData.userStatus === 'Busy' ? 'bg-red-400' :
                      formData.userStatus === 'Do Not Disturb' ? 'bg-purple-400' :
                      'bg-gray-400'
                    }`} />
                    {formData.userStatus || 'Available'}
                  </div>
                  <select
                    value={formData.userStatus || 'Available'}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormData(prev => ({ ...prev, userStatus: newStatus }));
                      handleStatusUpdate(newStatus);
                    }}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Away">Away</option>
                    <option value="Busy">Busy</option>
                    <option value="Do Not Disturb">Do Not Disturb</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              {/* Professional Stats Grid */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {user.role === 'student' && (
                    <>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.textPrimary} mb-1`}>
                          {user.modules?.length || user.subjects?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {isNewUser ? 0 : recentActivity.length}
                        </div>
                        <div className="text-sm text-gray-600">Activities</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {Math.floor((Date.now() - new Date(user.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-gray-600">Days Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {isNewUser ? '20' : (user.profilePic ? '100' : '85')}%
                        </div>
                        <div className="text-sm text-gray-600">Complete</div>
                      </div>
                    </>
                  )}

                  {user.role === 'tutor' && (
                    <>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.textPrimary} mb-1`}>
                          {isNewUser ? 0 : roleData.moduleStats?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {isNewUser ? 0 : roleData.moduleStats?.reduce((sum, m) => sum + m.students, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {isNewUser ? 0 : roleData.recentActivity?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {isNewUser ? 'New' : roleData.moduleStats?.length > 0 ? Math.round(roleData.moduleStats.reduce((sum, m) => sum + m.avgScore, 0) / roleData.moduleStats.length) + '%' : '0%'}
                        </div>
                        <div className="text-sm text-gray-600">Avg Score</div>
                      </div>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.textPrimary} mb-1`}>
                          {isNewUser ? '0' : roleData.systemStats?.[0]?.value || 0}
                        </div>
                        <div className="text-sm text-gray-600">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {isNewUser ? '0' : roleData.systemStats?.[1]?.value || 0}
                        </div>
                        <div className="text-sm text-gray-600">Tutors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {Math.floor((Date.now() - new Date(user.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-gray-600">Days Admin</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {isNewUser ? 'Good' : roleData.systemStats?.[3]?.value || 'Good'}
                        </div>
                        <div className="text-sm text-gray-600">System</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-1 px-6" role="tablist">
                {(user?.role === 'student' ? [
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'activity', label: 'Activity', icon: Clock },
                  { id: 'progress', label: 'Progress', icon: Award },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ] : user?.role === 'tutor' ? [
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'activity', label: 'Teaching', icon: Clock },
                  { id: 'modules', label: 'Modules', icon: Award },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ] : [
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'activity', label: 'Activity', icon: Clock },
                  { id: 'dashboard', label: 'Dashboard', icon: Award },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ]).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === id
                        ? `border-indigo-500 ${theme.textPrimary} bg-gray-50`
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    role="tab"
                  >
                    <Icon size={18} className="mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                  <div className={`px-4 py-2 rounded-lg ${theme.accent} text-sm font-medium`}>
                    {user.role === 'student' ? 'Student Profile' : 
                     user.role === 'tutor' ? 'Tutor Profile' : 
                     'Administrator Profile'}
                  </div>
                </div>
                
                {/* Profile Picture Upload Section */}
                {profilePic && (
                  <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Camera className="text-blue-600" size={20} />
                        <div>
                          <p className="font-medium text-blue-900">New profile picture selected</p>
                          <p className="text-sm text-blue-700">{profilePic.name}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleProfilePicUpload}
                          disabled={uploadingPic}
                          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                            uploadingPic ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                          } transition-colors`}
                        >
                          {uploadingPic ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                          onClick={() => {
                            setProfilePic(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="1"
                        max="150"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                        Role
                      </label>
                      <div className={`w-full px-4 py-3 rounded-lg ${theme.accent} font-medium capitalize cursor-not-allowed`}>
                        {formData.role}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  {user.role === 'student' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="university" className="block text-sm font-semibold text-gray-700 mb-2">
                            University
                          </label>
                          <input
                            type="text"
                            id="university"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Your university name"
                          />
                        </div>

                        <div>
                          <label htmlFor="degree" className="block text-sm font-semibold text-gray-700 mb-2">
                            Degree Program
                          </label>
                          <select
                            id="degree"
                            name="degree"
                            value={formData.degree}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          >
                            <option value="">Select your degree</option>
                            <option value="Bachelor of IT">Bachelor of Information Technology</option>
                            <option value="Bachelor of CS">Bachelor of Computer Science</option>
                            <option value="Bachelor of SE">Bachelor of Software Engineering</option>
                            <option value="Bachelor of IS">Bachelor of Information Systems</option>
                            <option value="Master of IT">Master of Information Technology</option>
                            <option value="Master of CS">Master of Computer Science</option>
                            <option value="PhD IT">PhD in Information Technology</option>
                            <option value="PhD CS">PhD in Computer Science</option>
                          </select>
                        </div>
                      </div>

                      {/* Modules Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Current Modules
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {moduleOptions.map(module => (
                              <label key={module} className="flex items-center p-2 hover:bg-white rounded-md transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.modules.includes(module)}
                                  onChange={() => handleModuleChange(module)}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                                />
                                <span className="text-sm text-gray-700">{module}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bio Section */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                      {user.role === 'student' ? 'Learning Notes' : 
                       user.role === 'tutor' ? 'Teaching Philosophy' :
                       'Admin Notes'}
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      placeholder={
                        user.role === 'student' ? 'Share your learning goals, study preferences, or session insights...' :
                        user.role === 'tutor' ? 'Describe your teaching approach and methodology...' :
                        'Administrative notes or system insights...'
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                        loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : theme.primaryBtn
                      }`}
                    >
                      {loading ? 'Updating Profile...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.role === 'student' ? 'Learning Activity' : 
                     user.role === 'tutor' ? 'Teaching Activity' :
                     'System Activity'}
                  </h2>
                  <div className={`px-4 py-2 rounded-lg ${theme.accent} text-sm font-medium`}>
                    {recentActivity.length} Recent Activities
                  </div>
                </div>
                
                {recentActivity.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Clock size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                    <p className="text-gray-600 mb-6">
                      {user.role === 'student' ? 'Start learning to see your activity here' :
                       user.role === 'tutor' ? 'Begin teaching to see your sessions here' :
                       'System activities will appear here'}
                    </p>
                    <div className={`inline-flex items-center px-6 py-3 rounded-lg ${theme.accent} text-sm font-medium`}>
                      Get Started
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'quiz' ? 'bg-green-100 text-green-600' :
                            activity.type === 'session' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'discussion' ? 'bg-purple-100 text-purple-600' :
                            activity.type === 'pastpaper' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type === 'quiz' ? '🎯' : 
                             activity.type === 'session' ? '📹' :
                             activity.type === 'discussion' ? '💬' :
                             activity.type === 'pastpaper' ? '📝' : '📊'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {activity.action}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{new Date(activity.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                              {activity.module && (
                                <span className={`px-2 py-1 rounded-md ${theme.accent} text-xs font-medium`}>
                                  {activity.module}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress/Modules/Dashboard Tab */}
            {(activeTab === 'progress' || activeTab === 'modules' || activeTab === 'dashboard') && (
              <div className="p-8">
                <div className="text-center py-16">
                  <Award size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'progress' ? 'Course Progress' :
                     activeTab === 'modules' ? 'Teaching Modules' :
                     'System Dashboard'}
                  </h3>
                  <p className="text-gray-600">Coming soon - detailed analytics and progress tracking</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Settings & Preferences</h2>
                  <div className={`px-4 py-2 rounded-lg ${theme.accent} text-sm font-medium`}>
                    Personal Settings
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* Notifications */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Mail size={20} className="mr-2" />
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 font-medium">Email Notifications</span>
                          <p className="text-sm text-gray-500">Receive updates about your courses and activities</p>
                        </div>
                        <input
                          type="checkbox"
                          name="preferences.emailNotifications"
                          checked={formData.preferences.emailNotifications}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 font-medium">Study Reminders</span>
                          <p className="text-sm text-gray-500">Get reminders for upcoming sessions and deadlines</p>
                        </div>
                        <input
                          type="checkbox"
                          name="preferences.studyReminders"
                          checked={formData.preferences.studyReminders}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 font-medium">Assignment Deadlines</span>
                          <p className="text-sm text-gray-500">Receive notifications about upcoming assignment deadlines</p>
                        </div>
                        <input
                          type="checkbox"
                          name="preferences.assignmentReminders"
                          checked={formData.preferences.assignmentReminders || true}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 font-medium">Discussion Updates</span>
                          <p className="text-sm text-gray-500">Get notified when someone replies to your posts</p>
                        </div>
                        <input
                          type="checkbox"
                          name="preferences.discussionUpdates"
                          checked={formData.preferences.discussionUpdates || true}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Learning Preferences */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Book size={20} className="mr-2" />
                      {user?.role === 'student' ? 'Learning Preferences' : 
                       user?.role === 'tutor' ? 'Teaching Preferences' : 
                       'System Preferences'}
                    </h3>
                    <div className="space-y-4">
                      {user?.role === 'student' && (
                        <>
                          <div className="space-y-6">
                            {/* Learning Preferences */}
                            <div className="border-l-4 border-indigo-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Learning Preferences</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Study Time
                                  </label>
                                  <select
                                    name="preferences.preferredStudyTime"
                                    value={formData.preferences.preferredStudyTime || 'morning'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="early-morning">Early Morning (5AM - 8AM)</option>
                                    <option value="morning">Morning (8AM - 12PM)</option>
                                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                                    <option value="evening">Evening (5PM - 9PM)</option>
                                    <option value="night">Night (9PM - 12AM)</option>
                                    <option value="late-night">Late Night (12AM - 3AM)</option>
                                    <option value="flexible">Flexible</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Learning Style
                                  </label>
                                  <select
                                    name="preferences.learningStyle"
                                    value={formData.preferences.learningStyle || 'visual'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="visual">Visual Learner (Charts, Diagrams, Videos)</option>
                                    <option value="auditory">Auditory Learner (Lectures, Podcasts, Discussions)</option>
                                    <option value="kinesthetic">Kinesthetic Learner (Hands-on, Practice Exercises)</option>
                                    <option value="reading">Reading/Writing Learner (Text-based Materials)</option>
                                    <option value="social">Social Learner (Group Studies, Peer Learning)</option>
                                    <option value="solitary">Solitary Learner (Self-paced, Independent Study)</option>
                                    <option value="mixed">Mixed Approach</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Session Duration
                                  </label>
                                  <select
                                    name="preferences.sessionDuration"
                                    value={formData.preferences.sessionDuration || '60min'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="30min">30 minutes</option>
                                    <option value="45min">45 minutes</option>
                                    <option value="60min">1 hour</option>
                                    <option value="90min">1.5 hours</option>
                                    <option value="120min">2 hours</option>
                                    <option value="flexible">Flexible Duration</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Study Management */}
                            <div className="border-l-4 border-teal-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Study Management & Goals</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weekly Study Goal (Hours)
                                  </label>
                                  <select
                                    name="preferences.weeklyStudyGoal"
                                    value={formData.preferences.weeklyStudyGoal || '10'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                  >
                                    <option value="5">5 hours/week</option>
                                    <option value="10">10 hours/week</option>
                                    <option value="15">15 hours/week</option>
                                    <option value="20">20 hours/week</option>
                                    <option value="25">25 hours/week</option>
                                    <option value="30">30+ hours/week</option>
                                    <option value="flexible">No Fixed Goal</option>
                                  </select>
                                </div>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Auto-enroll in recommended courses</span>
                                    <p className="text-sm text-gray-500">Automatically enroll based on your learning path</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.autoEnroll"
                                    checked={formData.preferences.autoEnroll || false}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Enable study streak tracking</span>
                                    <p className="text-sm text-gray-500">Track consecutive days of study activity</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.studyStreakTracking"
                                    checked={formData.preferences.studyStreakTracking || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Show difficulty level for content</span>
                                    <p className="text-sm text-gray-500">Display complexity indicators for materials</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.showDifficultyLevels"
                                    checked={formData.preferences.showDifficultyLevels || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Interaction & Support */}
                            <div className="border-l-4 border-pink-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Interaction & Support Preferences</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Help Method
                                  </label>
                                  <select
                                    name="preferences.preferredHelpMethod"
                                    value={formData.preferences.preferredHelpMethod || 'forum'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                  >
                                    <option value="forum">Discussion Forum</option>
                                    <option value="tutor-chat">Direct Tutor Chat</option>
                                    <option value="video-call">Video Call</option>
                                    <option value="email">Email Support</option>
                                    <option value="peer-study">Peer Study Groups</option>
                                    <option value="self-help">Self-Help Resources</option>
                                  </select>
                                </div>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Join study groups automatically</span>
                                    <p className="text-sm text-gray-500">Auto-join relevant peer study sessions</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.autoJoinStudyGroups"
                                    checked={formData.preferences.autoJoinStudyGroups || false}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Receive peer collaboration invites</span>
                                    <p className="text-sm text-gray-500">Get invitations for group projects and studies</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.receivePeerInvites"
                                    checked={formData.preferences.receivePeerInvites || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Enable AI study assistant</span>
                                    <p className="text-sm text-gray-500">Get AI-powered study recommendations and hints</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.enableAIAssistant"
                                    checked={formData.preferences.enableAIAssistant || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <>
                          <div className="space-y-6">
                            {/* System Management */}
                            <div className="border-l-4 border-red-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">System Management</h4>
                              <div className="space-y-3">
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Auto-approve tutor registrations</span>
                                    <p className="text-sm text-gray-500">Automatically approve new tutor sign-ups</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.autoApproveTutors"
                                    checked={formData.preferences.autoApproveTutors || false}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Enable bulk user operations</span>
                                    <p className="text-sm text-gray-500">Allow bulk delete/edit operations on users</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.enableBulkOperations"
                                    checked={formData.preferences.enableBulkOperations || false}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                </label>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    System Maintenance Window
                                  </label>
                                  <select
                                    name="preferences.maintenanceWindow"
                                    value={formData.preferences.maintenanceWindow || '2am-4am'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  >
                                    <option value="2am-4am">2:00 AM - 4:00 AM</option>
                                    <option value="12am-2am">12:00 AM - 2:00 AM</option>
                                    <option value="4am-6am">4:00 AM - 6:00 AM</option>
                                    <option value="custom">Custom Schedule</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* User Monitoring */}
                            <div className="border-l-4 border-orange-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">User Monitoring & Analytics</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dashboard Refresh Rate
                                  </label>
                                  <select
                                    name="preferences.dashboardRefreshRate"
                                    value={formData.preferences.dashboardRefreshRate || '30s'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  >
                                    <option value="15s">Every 15 seconds</option>
                                    <option value="30s">Every 30 seconds</option>
                                    <option value="1m">Every minute</option>
                                    <option value="5m">Every 5 minutes</option>
                                  </select>
                                </div>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Real-time user activity tracking</span>
                                    <p className="text-sm text-gray-500">Monitor users' online status and activities</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.realTimeTracking"
                                    checked={formData.preferences.realTimeTracking || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Generate weekly analytics reports</span>
                                    <p className="text-sm text-gray-500">Auto-generate system usage reports</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.weeklyReports"
                                    checked={formData.preferences.weeklyReports || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Security & Compliance */}
                            <div className="border-l-4 border-purple-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Security & Compliance</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Failed Login Attempt Threshold
                                  </label>
                                  <select
                                    name="preferences.loginAttemptThreshold"
                                    value={formData.preferences.loginAttemptThreshold || '5'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  >
                                    <option value="3">3 attempts</option>
                                    <option value="5">5 attempts</option>
                                    <option value="10">10 attempts</option>
                                    <option value="unlimited">Unlimited</option>
                                  </select>
                                </div>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Require 2FA for all users</span>
                                    <p className="text-sm text-gray-500">Force two-factor authentication system-wide</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.force2FA"
                                    checked={formData.preferences.force2FA || false}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Log all admin actions</span>
                                    <p className="text-sm text-gray-500">Create audit trail for administrative activities</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.auditLogging"
                                    checked={formData.preferences.auditLogging || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {user?.role === 'tutor' && (
                        <>
                          <div className="space-y-6">
                            {/* Teaching Management */}
                            <div className="border-l-4 border-green-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Course & Class Management</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Teaching Hours
                                  </label>
                                  <select
                                    name="preferences.preferredTeachingHours"
                                    value={formData.preferences.preferredTeachingHours || 'flexible'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  >
                                    <option value="morning">Morning (6AM - 12PM)</option>
                                    <option value="afternoon">Afternoon (12PM - 6PM)</option>
                                    <option value="evening">Evening (6PM - 10PM)</option>
                                    <option value="weekend">Weekends Only</option>
                                    <option value="flexible">Flexible Hours</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Students Per Session
                                  </label>
                                  <select
                                    name="preferences.maxStudentsPerSession"
                                    value={formData.preferences.maxStudentsPerSession || '20'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  >
                                    <option value="1">1-on-1 Only</option>
                                    <option value="5">Up to 5 Students</option>
                                    <option value="10">Up to 10 Students</option>
                                    <option value="15">Up to 15 Students</option>
                                    <option value="20">Up to 20 Students</option>
                                    <option value="30">Up to 30 Students</option>
                                    <option value="unlimited">Unlimited</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Break Duration
                                  </label>
                                  <select
                                    name="preferences.sessionBreakDuration"
                                    value={formData.preferences.sessionBreakDuration || '15min'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  >
                                    <option value="10min">10 minutes</option>
                                    <option value="15min">15 minutes</option>
                                    <option value="30min">30 minutes</option>
                                    <option value="60min">1 hour</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Student Management */}
                            <div className="border-l-4 border-blue-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Student Management</h4>
                              <div className="space-y-3">
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Accept new students automatically</span>
                                    <p className="text-sm text-gray-500">Auto-approve student enrollment requests</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.autoAcceptStudents"
                                    checked={formData.preferences.autoAcceptStudents || false}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Allow late assignment submissions</span>
                                    <p className="text-sm text-gray-500">Accept assignments after deadline with penalties</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.allowLateSubmissions"
                                    checked={formData.preferences.allowLateSubmissions || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </label>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade Release Policy
                                  </label>
                                  <select
                                    name="preferences.gradeReleasePolicy"
                                    value={formData.preferences.gradeReleasePolicy || 'immediate'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="immediate">Release Immediately</option>
                                    <option value="batch">Release in Batches</option>
                                    <option value="scheduled">Scheduled Release</option>
                                    <option value="manual">Manual Review First</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Communication & Feedback */}
                            <div className="border-l-4 border-yellow-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Communication & Feedback</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Response Time Goal
                                  </label>
                                  <select
                                    name="preferences.responseTimeGoal"
                                    value={formData.preferences.responseTimeGoal || '24h'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                  >
                                    <option value="1h">Within 1 hour</option>
                                    <option value="4h">Within 4 hours</option>
                                    <option value="24h">Within 24 hours</option>
                                    <option value="48h">Within 48 hours</option>
                                    <option value="1w">Within 1 week</option>
                                  </select>
                                </div>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Send feedback reminders</span>
                                    <p className="text-sm text-gray-500">Remind to provide feedback on student assignments</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.feedbackReminders"
                                    checked={formData.preferences.feedbackReminders || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <span className="text-gray-700 font-medium">Enable office hours booking</span>
                                    <p className="text-sm text-gray-500">Allow students to book one-on-one sessions</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    name="preferences.enableOfficeHours"
                                    checked={formData.preferences.enableOfficeHours || true}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings size={20} className="mr-2" />
                      Privacy & Security
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 font-medium">Show Profile to Other Users</span>
                          <p className="text-sm text-gray-500">Allow other users to view your profile information</p>
                        </div>
                        <input
                          type="checkbox"
                          name="preferences.publicProfile"
                          checked={formData.preferences.publicProfile !== false}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 font-medium">Allow Direct Messages</span>
                          <p className="text-sm text-gray-500">Let other users send you private messages</p>
                        </div>
                        <input
                          type="checkbox"
                          name="preferences.allowDirectMessages"
                          checked={formData.preferences.allowDirectMessages !== false}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                      {user?.role === 'student' && (
                        <label className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-700 font-medium">Share Progress with Tutors</span>
                            <p className="text-sm text-gray-500">Allow tutors to view your learning progress</p>
                          </div>
                          <input
                            type="checkbox"
                            name="preferences.shareProgressWithTutors"
                            checked={formData.preferences.shareProgressWithTutors !== false}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : theme.primaryBtn
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default UserProfile;