import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

/**
 * ForgotPasswordPage Component
 * 
 * Password reset request page.
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement forgot password API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-800">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent password reset instructions to <span className="font-semibold text-gray-800">{email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">Forgot Password?</h1>
          <p className="text-gray-600">No worries! We'll send you reset instructions.</p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold text-sm inline-flex items-center space-x-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
