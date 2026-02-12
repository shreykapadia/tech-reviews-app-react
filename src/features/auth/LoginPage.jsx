// src/features/auth/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient'; // Import supabase client

function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let emailToSignIn = identifier.trim();

      // If identifier doesn't look like an email, try to fetch email from username
      if (!identifier.includes('@')) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier.trim())
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: No rows found
          // Log the actual error but show a generic message to the user
          console.error('Error fetching profile by username:', profileError);
          throw new Error('Failed to find user. Please check your input.');
        }
        if (!profile) {
          throw new Error('Username not found. Please check your input or try with email.');
        }
        emailToSignIn = profile.email;
      }

      const { error: signInError } = await signIn(emailToSignIn, password);
      if (signInError) {
        throw signInError;
      }
      const from = location.state?.from || '/';
      navigate(from, { replace: true }); // `replace: true` prevents the login page from being in the history.
    } catch (err) {
      const invalidCredentialsMessage = 'Invalid login credentials';
      setError(err.message?.includes(invalidCredentialsMessage) ? invalidCredentialsMessage : (err.message || 'Failed to log in. Please try again.'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/92 dark:bg-slate-800/92 backdrop-blur-sm p-10 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.16)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.35)] border border-white/80 dark:border-slate-700/80">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">Email address or Username</label>
              <input
                id="identifier"
                name="identifier"
                type="text" // Changed to text to allow username
                autoComplete="username email" // Helps password managers
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-gray-900 dark:text-slate-100 dark:bg-slate-700 rounded-t-xl focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Email or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-gray-900 dark:text-slate-100 dark:bg-slate-700 rounded-b-xl focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-medium text-brand-primary hover:text-brand-primary-dark">
              Forgot your password?
            </Link>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 shadow-md shadow-brand-primary/25">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-brand-primary hover:text-brand-primary-dark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
