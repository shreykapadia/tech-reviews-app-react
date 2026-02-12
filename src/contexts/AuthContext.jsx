// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../services/supabaseClient'; // Adjust path as necessary
import Spinner from '../components/common/Spinner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // To store profile data like username
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId, retryCount = 0) => {
    if (!userId) {
      setUserProfile(null);
      return null;
    }

    try {
      // console.log(`[AuthContext] Fetching profile for user ID: ${userId} (Attempt ${retryCount + 1})`);
      // Create a promise that rejects after 15 seconds (increased from 5s)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timed out')), 15000)
      );

      // Race the supabase query against the timeout
      const { data, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('username, full_name, avatar_url, email, is_admin') // Keep original select fields
          .eq('id', userId)
          .single(),
        timeoutPromise
      ]);

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found, not an error here
        throw error; // Throw to be caught by the retry logic
      }
      // console.log('[AuthContext] Profile data fetched:', data);
      setUserProfile(data || null);
      return data || null;
    } catch (error) {
      console.error(`Error fetching user profile (Attempt ${retryCount + 1}):`, error);
      // Retry up to 2 times
      if (retryCount < 2) {
        console.log(`Retrying profile fetch... (${retryCount + 1}/2)`);
        // Add a small delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUserProfile(userId, retryCount + 1);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // console.log('[AuthContext] Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for changes in auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // console.log('[AuthContext] Auth state changed:', _event, session);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null); // Clear profile on logout or session expiry
        }
        // Ensure loading is set to false after potential async profile fetch
        if (loading) setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loading]); // Added loading to dependency array to ensure setLoading(false) is called correctly

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      setUserProfile(null); // Clear profile on failed sign-in
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, username) => {
    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      if (authData.user) {
        // The trigger 'on_auth_user_created' has created a basic profile. Now update it.
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: username, email: authData.user.email }) // Ensure email is also set/updated
          .eq('id', authData.user.id);
        if (profileError) {
          console.error('User created in auth, but failed to set username in profiles:', profileError);
          // Return a specific error indicating partial success if needed, or just the profileError
          throw { ...profileError, message: `User created, but username setup failed: ${profileError.message}` };
        }
        await fetchUserProfile(authData.user.id); // Fetch the newly updated profile
      }
      return { data: authData, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };



  const resetPassword = async (email) => {
    setLoading(true);
    // IMPORTANT: Replace with your actual redirect URL
    const YOUR_PASSWORD_RESET_REDIRECT_URL = `${window.location.origin}/update-password`;
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: YOUR_PASSWORD_RESET_REDIRECT_URL,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // onAuthStateChange will handle setting user, session, and userProfile to null
    setLoading(false);
  };

  const value = { user, userProfile, session, loading, signIn, signUp, resetPassword, signOut, fetchUserProfile };

  // console.log('[AuthContext] Providing value:', { user, userProfile, loading });
  return <AuthContext.Provider value={value}>{loading ? <Spinner /> : children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
