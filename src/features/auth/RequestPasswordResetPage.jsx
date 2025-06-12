// src/features/auth/RequestPasswordResetPage.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

function RequestPasswordResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        // Even if there's an error, show a generic message for security.
        // Log the actual error for debugging.
        console.error('Password reset request error:', resetError);
      }
      setMessage('If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder).');
      setEmail(''); // Clear the input field
    } catch (err) {
      // This catch block might not be strictly necessary if resetPassword handles its own errors
      // and returns an error object, but it's good for unexpected issues.
      console.error('Unexpected error during password reset request:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          
          {!message && ( // Hide form if message is shown
            <>
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              </div>
              <div>
                <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          )}
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="font-medium text-brand-primary hover:text-brand-primary-dark">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RequestPasswordResetPage;