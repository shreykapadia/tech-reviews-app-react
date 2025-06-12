// src/features/user/DashboardPage.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path if necessary

function DashboardPage() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and loading is complete
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <p className="text-lg text-gray-700">Loading user data...</p>
      </div>
    );
  }

  // This check is mostly a fallback, as useEffect should handle the redirect.
  if (!user) {
    return null; // Or a redirecting message, but navigate in useEffect is preferred
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6 md:p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, <span className="text-brand-primary">{user.email}</span>!
        </h1>
        <p className="text-gray-700 mb-4">
          This is your personal dashboard. You can manage your profile and settings here.
        </p>
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Your Account</h2>
            <p className="text-gray-600 mt-2">User ID: {user.id}</p>
            <p className="text-gray-600 mt-1">More profile features coming soon!</p>
          </div>
          {/* Placeholder for future dashboard content */}
        </div>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-medium rounded-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition duration-150 ease-in-out"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;