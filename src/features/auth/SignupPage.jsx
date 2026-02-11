// src/features/auth/SignupPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await signUp(email, password, username); // Pass username
      if (signUpError) {
        throw signUpError;
      }
      // Supabase sends a confirmation email if enabled.
      // The user object might be in data.user, but session will be null until confirmation.
      if (data?.user && !data?.session) {
         setMessage('Registration successful! Please check your email for a verification link to activate your account.');
         setEmail(''); // Clear form
         setUsername('');
         setPassword('');
      } else if (data?.session) {
        // This case might happen if auto-confirm is on or for social logins (though not used here)
        setMessage('Registration successful! You are now logged in.');
        setTimeout(() => navigate('/'), 2000); // Redirect after a short delay
      } else {
        // Fallback message if user data is not as expected
        setMessage('Registration attempted. Please check your email or try logging in.');
      }
    } catch (err) {
      if (err.message && (err.message.includes('profiles_username_key') || err.message.includes('duplicate key value violates unique constraint "profiles_username_key"'))) {
        setError('This username is already taken. Please choose another one.');
      } else {
        setError(err.message || 'Failed to sign up. Please try again.');
      }
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
    >
      {/* Overlay to darken the background image a bit for better readability of the form, optional */}
      {/* <div className="absolute inset-0 bg-black opacity-30"></div> */}

      <div className="max-w-md w-full space-y-8 bg-white/92 backdrop-blur-sm p-10 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.16)] border border-white/80">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          {message && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}

          {!message && ( // Hide form fields if success message is shown
            <>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="username" className="sr-only">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-gray-900 rounded-t-xl focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                    placeholder="Username (3-20 chars, a-z, 0-9, _)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-gray-900 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-gray-900 rounded-b-xl focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <button type="submit" disabled={loading || !!message} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 shadow-md shadow-brand-primary/25">
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </>
          )}
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-primary hover:text-brand-primary-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
