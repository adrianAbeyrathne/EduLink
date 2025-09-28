import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { UserIcon, BookIcon, ShieldIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import GoogleSignInButton from './GoogleSignInButton';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated after signup, redirecting to dashboard...");
      toast.success(`Welcome, ${user.name}!`);
      // Use setTimeout to ensure state updates have completed
      const timeoutId = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 Starting signup process...');
      
      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        toast.error('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      console.log('✅ Validation passed, calling API...');

      // Call backend registration API
      const response = await authAPI.register({
        name,
        email,
        password,
        role,
        age: 18 // Default age, can be updated later in profile
      });

      console.log('✅ API response received:', response);

      if (response.user && response.token) {
        // Update auth context with both user and token
        login(response.user, response.token);
        
        toast.success('Account created successfully!');
        
        console.log('✅ Registration successful, user logged in');
        
        // Navigate directly instead of relying on useEffect
        console.log('✅ Navigating to dashboard after successful registration');
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
        
      } else {
        throw new Error("Invalid response: missing user data or token");
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/signin"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="text-center mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your account type:
              </label>
              <p className="text-xs text-blue-600 mb-4">
                💡 Select the role that best describes you
              </p>
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                type="button"
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                  role === 'student'
                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md'
                    : 'bg-white border border-gray-200 hover:bg-blue-50'
                }`}
                onClick={() => setRole('student')}
              >
                <UserIcon
                  className={`h-8 w-8 ${
                    role === 'student' ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`mt-2 text-sm font-medium ${
                    role === 'student' ? 'text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  Student
                </span>
              </button>

              <button
                type="button"
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                  role === 'tutor'
                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md'
                    : 'bg-white border border-gray-200 hover:bg-blue-50'
                }`}
                onClick={() => setRole('tutor')}
              >
                <BookIcon
                  className={`h-8 w-8 ${
                    role === 'tutor' ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`mt-2 text-sm font-medium ${
                    role === 'tutor' ? 'text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  Tutor
                </span>
              </button>

              <button
                type="button"
                className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                  role === 'admin'
                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-md'
                    : 'bg-white border border-gray-200 hover:bg-blue-50'
                }`}
                onClick={() => setRole('admin')}
              >
                <ShieldIcon
                  className={`h-8 w-8 ${
                    role === 'admin' ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`mt-2 text-sm font-medium ${
                    role === 'admin' ? 'text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  Admin
                </span>
              </button>
            </div>

            {/* Google Sign-In Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-4">
                <GoogleSignInButton
                  onSuccess={() => {
                    toast.success('Redirecting to Google Sign-In...');
                  }}
                  onError={(error) => {
                    toast.error('Failed to initiate Google Sign-In');
                    console.error('Google Sign-In Error:', error);
                  }}
                />
              </div>

              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or create account with email</span>
                </div>
              </div>
            </div>

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-blue-50"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-blue-50"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-blue-50"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-blue-50"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {role === 'tutor' && (
              <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Tutor accounts require verification by an admin before full
                      access is granted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Admin registrations require approval from an existing administrator.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'
                }`}
              >
                {loading ? 'Creating Account...' : 'Sign up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
