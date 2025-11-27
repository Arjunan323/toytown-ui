import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { login } from '../../store/slices/authSlice';

/**
 * LoginPage Component
 * 
 * User login page with email/password authentication and OAuth options.
 * Redirects to intended page after successful login.
 * 
 * @component
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      // Redirect to intended page or home
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      // Error is handled by Redux state
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login');
    // window.location.href = `${API_BASE_URL}/oauth2/authorize/google`;
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login');
    // window.location.href = `${API_BASE_URL}/oauth2/authorize/facebook`;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* OAuth Buttons */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mb: 2, textTransform: 'none', py: 1.5 }}
          >
            Continue with Google
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FacebookIcon />}
            onClick={handleFacebookLogin}
            sx={{ textTransform: 'none', py: 1.5 }}
          >
            Continue with Facebook
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={Boolean(formErrors.email)}
            helperText={formErrors.email}
            margin="normal"
            autoComplete="email"
            autoFocus
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={Boolean(formErrors.password)}
            helperText={formErrors.password}
            margin="normal"
            autoComplete="current-password"
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

          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign Up Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              state={{ from }}
              sx={{ textDecoration: 'none', fontWeight: 'bold' }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
