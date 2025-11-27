import api from './api';

/**
 * Admin authentication service for administrator login and token management.
 * Handles JWT tokens with ADMIN role claims.
 */
const adminAuthService = {
  /**
   * Authenticate an administrator user.
   * 
   * @param {Object} credentials - Admin login credentials
   * @param {string} credentials.username - Admin username
   * @param {string} credentials.password - Admin password
   * @returns {Promise<Object>} Authentication response with JWT token
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/admin/login', credentials);
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens and user info in localStorage
      localStorage.setItem('adminAccessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('adminRefreshToken', refreshToken);
      }
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  },

  /**
   * Logout admin user by clearing tokens.
   */
  logout() {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
  },

  /**
   * Get current admin user from localStorage.
   * 
   * @returns {Object|null} Current admin user or null if not logged in
   */
  getCurrentAdmin() {
    const adminUserJson = localStorage.getItem('adminUser');
    return adminUserJson ? JSON.parse(adminUserJson) : null;
  },

  /**
   * Check if admin user is authenticated.
   * 
   * @returns {boolean} True if admin is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('adminAccessToken');
  },

  /**
   * Get admin access token.
   * 
   * @returns {string|null} Admin access token or null
   */
  getAccessToken() {
    return localStorage.getItem('adminAccessToken');
  },

  /**
   * Validate admin token with backend.
   * 
   * @returns {Promise<boolean>} True if token is valid
   */
  async validateToken() {
    try {
      const token = this.getAccessToken();
      if (!token) return false;

      await api.get('/auth/admin/validate', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
};

export default adminAuthService;
