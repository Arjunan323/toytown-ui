import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

// Async thunks for authentication operations

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { accessToken, refreshToken, customer } = response.data;

      // Store tokens and user data in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(customer));

      return { accessToken, refreshToken, user: customer };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { accessToken, refreshToken, customer } = response.data;

      // Store tokens and user data in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(customer));

      return { accessToken, refreshToken, user: customer };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

// OAuth login success handler
export const oauthLoginSuccess = createAsyncThunk(
  'auth/oauthLoginSuccess',
  async ({ email, firstName, lastName, provider, providerId }, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/oauth2/success', {
        params: { email, firstName, lastName, provider, providerId },
      });
      const { accessToken, refreshToken, customer } = response.data;

      // Store tokens and user data in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(customer));

      return { accessToken, refreshToken, user: customer };
    } catch (error) {
      const message = error.response?.data?.message || 'OAuth login failed';
      return rejectWithValue(message);
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Note: Backend doesn't need logout endpoint for JWT (client-side removal is sufficient)
  return null;
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Update user profile
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // OAuth Login Success
      .addCase(oauthLoginSuccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(oauthLoginSuccess.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(oauthLoginSuccess.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
