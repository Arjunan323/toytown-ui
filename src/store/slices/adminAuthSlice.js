import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAuthService } from '../../services';

// Initial state
const getAdminUserFromStorage = () => {
  try {
    const adminUserJson = localStorage.getItem('adminUser');
    return adminUserJson ? JSON.parse(adminUserJson) : null;
  } catch (error) {
    console.error('Error parsing adminUser from localStorage:', error);
    return null;
  }
};

const initialState = {
  adminUser: getAdminUserFromStorage(),
  adminToken: localStorage.getItem('adminAccessToken') || null,
  isAdminAuthenticated: !!localStorage.getItem('adminAccessToken'),
  loading: false,
  error: null,
};

// Async thunks for admin authentication operations

/**
 * Admin login thunk.
 * Authenticates an administrator and stores JWT token with ADMIN role.
 */
export const adminLogin = createAsyncThunk(
  'adminAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await adminAuthService.login(credentials);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Admin logout thunk.
 * Clears admin tokens and user data.
 */
export const adminLogout = createAsyncThunk(
  'adminAuth/logout',
  async () => {
    adminAuthService.logout();
    return null;
  }
);

/**
 * Validate admin token thunk.
 * Checks if current admin token is valid.
 */
export const validateAdminToken = createAsyncThunk(
  'adminAuth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const isValid = await adminAuthService.validateToken();
      if (!isValid) {
        throw new Error('Invalid token');
      }
      return true;
    } catch (error) {
      return rejectWithValue('Token validation failed');
    }
  }
);

// Admin auth slice
const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    // Clear admin error
    clearAdminError: (state) => {
      state.error = null;
    },
    // Set admin from localStorage (on app init)
    setAdminFromStorage: (state) => {
      try {
        const adminUserJson = localStorage.getItem('adminUser');
        const adminUser = adminUserJson ? JSON.parse(adminUserJson) : null;
        const adminToken = localStorage.getItem('adminAccessToken');
        
        if (adminUser && adminToken) {
          state.adminUser = adminUser;
          state.adminToken = adminToken;
          state.isAdminAuthenticated = true;
        }
      } catch (error) {
        console.error('Error loading admin from storage:', error);
        state.adminUser = null;
        state.adminToken = null;
        state.isAdminAuthenticated = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminUser = action.payload.user;
        state.adminToken = action.payload.accessToken;
        state.isAdminAuthenticated = true;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAdminAuthenticated = false;
      })
      
      // Admin logout
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminUser = null;
        state.adminToken = null;
        state.isAdminAuthenticated = false;
        state.error = null;
      })
      
      // Validate token
      .addCase(validateAdminToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateAdminToken.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(validateAdminToken.rejected, (state) => {
        state.loading = false;
        state.adminUser = null;
        state.adminToken = null;
        state.isAdminAuthenticated = false;
        adminAuthService.logout();
      });
  },
});

export const { clearAdminError, setAdminFromStorage } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
