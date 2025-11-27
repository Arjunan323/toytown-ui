import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { authService } from '../../services';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setValidating(false);
        return;
      }

      try {
        const isValid = await authService.validateResetToken(token);
        if (isValid) {
          setTokenValid(true);
        } else {
          setError('This reset link is invalid or has expired. Please request a new one.');
        }
      } catch (err) {
        setError('This reset link is invalid or has expired. Please request a new one.');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.newPassword) {
      errors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.newPassword)) {
      errors.newPassword = 'Password must contain letters and numbers';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
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

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword({
        token,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful. Please sign in with your new password.' },
        });
      }, 3000);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(
        err.response?.data?.message ||
        'Failed to reset password. Please try again or request a new reset link.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Validating reset link...</Typography>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Password Reset Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to sign in page...
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="error">
            Invalid Reset Link
          </Typography>
          <Alert severity="error" sx={{ my: 3 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Password reset links expire after 24 hours for security reasons.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              component={Link}
              to="/forgot-password"
              fullWidth
            >
              Request New Reset Link
            </Button>
            <Button variant="outlined" component={Link} to="/login" fullWidth>
              Back to Sign In
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Reset Password
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter your new password below
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange}
            error={Boolean(formErrors.newPassword)}
            helperText={formErrors.newPassword || 'Minimum 8 characters with letters and numbers'}
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
            label="Confirm New Password"
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
            sx={{ py: 1.5, mt: 3 }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
