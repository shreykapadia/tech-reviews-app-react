// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient'; // Adjust path as necessary

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes in auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      // authListener is the 'data' object from onAuthStateChange, which contains the subscription
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    try {
      // Supabase handles sending the confirmation email if enabled in settings.
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // The user object in `data.user` will contain the new user if successful,
      // but they will need to confirm their email before their session is active.
      return { data, error: null };
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
    // onAuthStateChange will handle setting user and session to null
    setLoading(false);
  };

  const value = { user, session, loading, signIn, signUp, resetPassword, signOut };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};