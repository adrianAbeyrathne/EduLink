import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import NavItem from './NavItem';
import { useAuth } from '../../context/AuthContext';

function Nav() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  // Get user role, default to 'student' if not specified
  const userRole = user?.role || 'student';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-400 w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xl">E</span>
            </div>
            <span className="text-white text-2xl font-bold">EduLink</span>
          </div>
          
          {/* Navigation Links */}
          <ul className="flex space-x-8">
            <li>
              <NavItem 
                to="/" 
                label="Home" 
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                }
              />
            </li>
            
            {/* Show these navigation items only for authenticated users */}
            {isAuthenticated && (
              <>
                <li>
                  <NavItem 
                    to="/dashboard" 
                    label="Dashboard" 
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    }
                  />
                </li>
                <li>
                  <NavItem 
                    to="/academics" 
                    label="Academics" 
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    }
                  />
                </li>
                <li>
                  <NavItem 
                    to="/sessions" 
                    label="Sessions" 
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    }
                  />
                </li>
                <li>
                  <NavItem 
                    to="/help" 
                    label="Help Center" 
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    }
                  />
                </li>

                {/* Admin-only links */}
                {userRole === 'admin' && (
                  <li>
                    <NavItem 
                      to="/user-management" 
                      label="User Management" 
                      icon={
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                      }
                    />
                  </li>
                )}
              </>
            )}


            <li>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* User Info Display */}
                  {user && (
                    <div className="text-white flex items-center space-x-2">
                      <Link to="/profile" className="flex items-center space-x-2 hover:text-yellow-300 transition-colors">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-gray-900 font-bold text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-sm font-medium">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-300 capitalize">{userRole}</p>
                        </div>
                      </Link>
                    </div>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium text-lg hover:bg-yellow-300 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/signin" 
                  className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium text-lg hover:bg-yellow-300 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
          
          {/* Mobile menu button - you can expand this later */}
          <div className="md:hidden">
            <button className="text-white hover:text-yellow-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Nav
