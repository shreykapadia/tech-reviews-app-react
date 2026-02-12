// src/features/auth/UpdatePasswordPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient'; // Direct Supabase client
import { AuthContext } from '../../contexts/AuthContext';

function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useContext(AuthContext); // Get session to check if user is already logged in
  const navigate = useNavigate();

  // This useEffect will check if the user is already on this page with a valid session
  // from the password reset link. Supabase handles the session automatically if the
  // URL contains the correct tokens.
  useEffect(() => {
    // Supabase's onAuthStateChange in AuthContext handles setting the session
    // if the user arrives via a password reset link with a valid token.
    // We can add a check here if needed, but updateUser will fail if session is not valid for reset.
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // supabase.auth.updateUser will use the session from the URL (magic link/reset token)
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage('Password updated successfully! You can now log in with your new password.');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password. The link may have expired or been used already.');
      console.error('Update password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/92 dark:bg-slate-800/92 backdrop-blur-sm p-10 rounded-2xl shadow-[0_20px_44px_rgba(8,38,67,0.16)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.35)] border border-white/80 dark:border-slate-700/80">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Update Your Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          {message && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}

          {!message && ( // Hide form if success message is shown
            <>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="new-password" className="sr-only">New Password</label>
                  <input id="new-password" name="newPassword" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-gray-900 dark:text-slate-100 dark:bg-slate-700 rounded-t-xl focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="New Password (min. 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="sr-only">Confirm New Password</label>
                  <input id="confirm-new-password" name="confirmNewPassword" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-gray-900 dark:text-slate-100 dark:bg-slate-700 rounded-b-xl focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Confirm New Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={loading} />
                </div>
              </div>
              <div>
                <button type="submit" disabled={loading || !!message} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 shadow-md shadow-brand-primary/25">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default UpdatePasswordPage;
