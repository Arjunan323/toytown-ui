import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { adminLogin, clearAdminError } from '../../store/slices';

/**
 * Admin login page.
 * Authenticates administrators and redirects to admin dashboard.
 */
const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdminAuthenticated, loading, error } = useSelector((state) => state.adminAuth);

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  useEffect(() => {
    // Clear errors when component unmounts
    return () => {
      dispatch(clearAdminError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await dispatch(adminLogin(credentials));
    
    if (adminLogin.fulfilled.match(result)) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              🧸 ToyTown
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Admin Panel
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
              margin="normal"
            />

            <TextField
              fullWidth
              required
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Authorized Personnel Only
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;
