import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          let errorMessage = 'Google authentication failed';
          switch (error) {
            case 'google_auth_failed':
              errorMessage = 'Google authentication failed. Please try again.';
              break;
            case 'callback_failed':
              errorMessage = 'Authentication callback failed. Please try again.';
              break;
            default:
              errorMessage = 'Authentication failed. Please try again.';
          }
          
          toast.error(errorMessage);
          navigate('/signin', { replace: true });
          return;
        }

        if (!token || !userParam) {
          toast.error('Invalid authentication response');
          navigate('/signin', { replace: true });
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Login the user
        login(user, token);
        
        // Show success message with welcome
        toast.success(`Welcome ${user.name}! Successfully signed in with Google.`, {
          duration: 4000,
          icon: '🎉',
        });

        // Redirect to dashboard based on role
        let redirectPath = '/dashboard';
        if (user.role === 'admin') {
          redirectPath = '/admin-dashboard';
        } else if (user.role === 'tutor') {
          redirectPath = '/tutor-dashboard';
        }

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);

      } catch (error) {
        console.error('Google callback error:', error);
        toast.error('Authentication processing failed. Please try again.');
        navigate('/signin', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Signing you in...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Processing your Google authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;