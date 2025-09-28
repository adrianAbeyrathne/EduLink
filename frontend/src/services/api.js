import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    console.log('🌐 Making API call to:', API_BASE_URL + '/auth/register');
    console.log('📤 Sending data:', userData);
    
    try {
      const response = await api.post('/auth/register', userData);
      console.log('📥 API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚨 API Error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Verify 2FA OTP
  verify2FA: async (data) => {
    const response = await api.post('/auth/verify-2fa', data);
    return response.data;
  },

  // Enable 2FA
  enable2FA: async () => {
    const response = await api.post('/auth/enable-2fa');
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (data) => {
    const response = await api.post('/auth/disable-2fa', data);
    return response.data;
  },
};

export default api;