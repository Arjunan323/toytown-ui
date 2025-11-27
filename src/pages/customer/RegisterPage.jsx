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
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { register } from '../../store/slices/authSlice';

/**
 * RegisterPage Component
 * 
 * User registration page with form validation and OAuth options.
 * Creates new customer account and redirects to login or home.
 * 
 * @component
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length > 100) {
      errors.firstName = 'First name must be less than 100 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 100) {
      errors.lastName = 'Last name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Phone validation (optional)
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain letters and numbers';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      await dispatch(register(registerData)).unwrap();
      // Redirect to home or intended page after successful registration
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      // Error is handled by Redux state
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log('Google signup');
  };

  const handleFacebookSignup = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook signup');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join Aadhav's ToyTown today
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
            onClick={handleGoogleSignup}
            sx={{ mb: 2, textTransform: 'none', py: 1.5 }}
          >
            Sign up with Google
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FacebookIcon />}
            onClick={handleFacebookSignup}
            sx={{ textTransform: 'none', py: 1.5 }}
          >
            Sign up with Facebook
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={Boolean(formErrors.firstName)}
                helperText={formErrors.firstName}
                autoComplete="given-name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={Boolean(formErrors.lastName)}
                helperText={formErrors.lastName}
                autoComplete="family-name"
              />
            </Grid>
          </Grid>

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
          />

          <TextField
            fullWidth
            label="Phone Number (Optional)"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={Boolean(formErrors.phoneNumber)}
            helperText={formErrors.phoneNumber || 'Enter 10-digit mobile number'}
            margin="normal"
            autoComplete="tel"
            inputProps={{ maxLength: 10 }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={Boolean(formErrors.password)}
            helperText={formErrors.password || 'Minimum 8 characters with letters and numbers'}
            margin="normal"
            autoComplete="new-password"
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

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={Boolean(formErrors.confirmPassword)}
            helperText={formErrors.confirmPassword}
            margin="normal"
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mt: 3, mb: 2 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            By signing up, you agree to our{' '}
            <Link href="/terms" sx={{ textDecoration: 'none' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" sx={{ textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </Typography>
        </form>

        {/* Sign In Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              state={{ from }}
              sx={{ textDecoration: 'none', fontWeight: 'bold' }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
