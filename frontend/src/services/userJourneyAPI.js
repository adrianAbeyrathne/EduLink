// User Journey API functions
const API_BASE_URL = 'http://localhost:5000/api/user-journey';

export const userJourneyAPI = {
  // Get user's dashboard data
  getDashboard: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/${userId}`);
    return await response.json();
  },

  // Update onboarding progress
  updateOnboarding: async (userId, data) => {
    const response = await fetch(`${API_BASE_URL}/onboarding/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  // Award achievement
  awardAchievement: async (userId, data) => {
    const response = await fetch(`${API_BASE_URL}/achievement/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  // Track activity
  trackActivity: async (userId, activityType, value = 1) => {
    const response = await fetch(`${API_BASE_URL}/activity/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ activityType, value })
    });
    return await response.json();
  },

  // Get progress details
  getProgress: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/progress/${userId}`);
    return await response.json();
  }
};

export default userJourneyAPI;