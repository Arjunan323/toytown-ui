import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    // Check for admin token first (for admin routes), then regular token
    const adminToken = localStorage.getItem('adminAccessToken');
    const token = localStorage.getItem('accessToken');
    
    // Use admin token for admin routes, otherwise use regular token
    const authToken = config.url?.includes('/admin') ? (adminToken || token) : (token || adminToken);
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Attempt to refresh the access token
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;

          // Store new access token
          localStorage.setItem('accessToken', accessToken);

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'An error occurred';
      console.error('API Error:', errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', 'No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
