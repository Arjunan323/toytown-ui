import api from './api';

/**
 * Authentication Service
 * Handles user registration, login, logout, and OAuth operations
 */
const authService = {
  /**
   * Register a new customer account
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} userData.phoneNumber - User phone number
   * @returns {Promise} Response with JWT tokens and user data
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} Response with JWT tokens and user data
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Handle OAuth login success callback
   * @param {Object} oauthData - OAuth user data
   * @param {string} oauthData.email - User email from OAuth provider
   * @param {string} oauthData.firstName - User first name
   * @param {string} oauthData.lastName - User last name
   * @param {string} oauthData.provider - OAuth provider (google, facebook)
   * @param {string} oauthData.providerId - Provider-specific user ID
   * @returns {Promise} Response with JWT tokens and user data
   */
  oauthLoginSuccess: async (oauthData) => {
    const response = await api.get('/auth/oauth2/success', {
      params: oauthData,
    });
    return response.data;
  },

  /**
   * Logout current user
   * Note: For JWT, logout is handled client-side by removing tokens
   * Backend endpoint is optional for token blacklisting
   * @returns {Promise} Logout confirmation
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      // Even if backend fails, clear local tokens
      console.error('Logout error:', error);
      return { message: 'Logged out locally' };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data with addresses
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @param {string} profileData.firstName - Updated first name
   * @param {string} profileData.lastName - Updated last name
   * @param {string} profileData.phoneNumber - Updated phone number
   * @returns {Promise} Updated user profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Request password reset link
   * @param {string} email - User email
   * @returns {Promise} Confirmation message
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Reset password data
   * @param {string} resetData.token - Password reset token
   * @param {string} resetData.newPassword - New password
   * @returns {Promise} Confirmation message
   */
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  /**
   * Validate password reset token
   * @param {string} token - Password reset token
   * @returns {Promise<boolean>} Token validity
   */
  validateResetToken: async (token) => {
    const response = await api.get('/auth/validate-reset-token', {
      params: { token },
    });
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} New access token
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Initiate Google OAuth login
   * Redirects to backend OAuth endpoint
   */
  loginWithGoogle: () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  },

  /**
   * Initiate Facebook OAuth login
   * Redirects to backend OAuth endpoint
   */
  loginWithFacebook: () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    window.location.href = `${baseUrl}/oauth2/authorization/facebook`;
  },
};

export default authService;
