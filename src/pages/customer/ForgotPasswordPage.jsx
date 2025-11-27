import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      console.error('Forgot password failed:', err);
      setError(
        err.response?.data?.message || 
        'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-icon">✓</div>
          <h1>Check Your Email</h1>
          <p className="success-message">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <p className="info-message">
            If you don't see the email, please check your spam folder.
          </p>
          <div className="action-links">
            <Link to="/login" className="btn btn-primary">
              Back to Sign In
            </Link>
          </div>
          <div className="help-text">
            <p>Didn't receive the email?</p>
            <button 
              onClick={() => setSuccess(false)} 
              className="link-button"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              className={error ? 'error' : ''}
              disabled={loading}
              autoComplete="email"
              placeholder="Enter your email"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
