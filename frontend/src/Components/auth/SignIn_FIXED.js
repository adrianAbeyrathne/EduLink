import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { UserIcon, BookIcon, ShieldIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import GoogleSignInButton from './GoogleSignInButton';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleWarning, setRoleWarning] = useState("");
  const [userActualRole, setUserActualRole] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Already authenticated, redirecting to dashboard...");
      const from = location.state?.from?.pathname || "/dashboard";
      toast.success(`Welcome back, ${user.name}!`);
      // Use setTimeout to ensure state updates have completed
      const timeoutId = setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (userActualRole) {
      if (userActualRole !== selectedRole) {
        setRoleWarning(`This account is registered as ${userActualRole}. Please select ${userActualRole}.`);
      } else {
        setRoleWarning("");
      }
    } else {
      setRoleWarning("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with:", { email, role, hasPassword: !!password });
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Attempting login with:", { email, role });
      const response = await authAPI.login({ email, password, role });
      console.log("Login response received:", response);
      
      if (response.requires2FA && response.userId) {
        toast.success("Please check your email for the verification code");
        navigate('/auth/2fa', { state: { userId: response.userId }, replace: true });
        return;
      }
      
      // Handle successful login even if role doesn't match exactly
      if (role && response?.user?.role && response.user.role !== role) {
        console.log(`Role mismatch: selected ${role}, actual ${response.user.role}`);
        toast.success(`Logged in as ${response.user.role}`);
      }
      
      if (response.user && response.token) {
        console.log("Successful login, updating auth state");
        // Clear any role warnings on successful login
        setRoleWarning("");
        setUserActualRole("");
        
        // Log the user in - let useEffect handle navigation
        login(response.user, response.token);
        toast.success("Login successful! Redirecting...");
        
        // Don't navigate here - let useEffect handle it to avoid race condition
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response: missing user data or token");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Handle role mismatch errors
        if (errorMessage.includes("This account is not registered as")) {
          const actualRole = errorMessage.match(/not registered as (\w+)/)?.[1];
          if (actualRole) {
            setUserActualRole(actualRole);
            setRoleWarning(`This account is registered as ${actualRole}. Please select ${actualRole}.`);
            errorMessage = `You selected the ${role} role, but this account is registered as a ${actualRole}. Please select the correct role and try again.`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">create a new account</Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-sm font-medium text-gray-700">Select your account type:</label>
                {roleWarning && (
                  <div className="text-xs text-red-700 mt-2 font-bold bg-red-100 p-4 rounded-lg border-2 border-red-300 animate-pulse shadow-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 text-2xl animate-bounce">⚠️</span>
                      <span className="text-sm font-extrabold">{roleWarning}</span>
                    </div>
                    <div className="text-xs text-red-600 mt-2 font-normal bg-red-50 p-2 rounded border">
                       This message stays visible so you can read it properly!
                    </div>
                  </div>
                )}
                {!roleWarning && (
                  <p className="text-xs text-gray-500 mt-1">Choose the role that matches your account</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${role === "student" ? "bg-indigo-100 border-2 border-indigo-500 shadow-md" : "bg-white border border-gray-200 hover:bg-blue-50"}`} onClick={() => handleRoleSelect("student")}>
                  <UserIcon className={`h-8 w-8 ${role === "student" ? "text-indigo-600" : "text-gray-500"}`} />
                  <span className={`mt-2 text-sm font-medium ${role === "student" ? "text-indigo-700" : "text-gray-700"}`}>Student</span>
                </button>
                <button type="button" className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${role === "tutor" ? "bg-indigo-100 border-2 border-indigo-500 shadow-md" : "bg-white border border-gray-200 hover:bg-blue-50"}`} onClick={() => handleRoleSelect("tutor")}>
                  <BookIcon className={`h-8 w-8 ${role === "tutor" ? "text-indigo-600" : "text-gray-500"}`} />
                  <span className={`mt-2 text-sm font-medium ${role === "tutor" ? "text-indigo-700" : "text-gray-700"}`}>Tutor</span>
                </button>
                <button type="button" className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${role === "admin" ? "bg-indigo-100 border-2 border-indigo-500 shadow-md" : "bg-white border border-gray-200 hover:bg-blue-50"}`} onClick={() => handleRoleSelect("admin")}>
                  <ShieldIcon className={`h-8 w-8 ${role === "admin" ? "text-indigo-600" : "text-gray-500"}`} />
                  <span className={`mt-2 text-sm font-medium ${role === "admin" ? "text-indigo-700" : "text-gray-700"}`}>Admin</span>
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
              </div>
              <div className="mt-4">
                <GoogleSignInButton 
                  onSuccess={() => toast.success('Redirecting to Google Sign-In...')} 
                  onError={(error) => {
                    toast.error('Failed to initiate Google Sign-In'); 
                    console.error('Google Sign-In Error:', error);
                  }} 
                />
              </div>
              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or sign in with email</span></div>
              </div>
            </div>
            
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <input 
                  id="email-address" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-blue-50" 
                  placeholder="Email address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password" 
                  required 
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-blue-50" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>
              <div className="text-sm">
                <Link to="/reset-password" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</Link>
              </div>
            </div>
            
            <div>
              <button 
                type="submit" 
                disabled={loading} 
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200 ${
                  loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                }`}
              >
                {loading ? "Signing in..." : (isAuthenticated ? "Redirecting..." : "Sign in")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;