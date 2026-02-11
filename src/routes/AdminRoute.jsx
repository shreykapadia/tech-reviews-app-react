import React, { useContext } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function AdminRoute({ children }) {
  const { user, userProfile, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="loader h-10 w-10 border-4 border-t-4 border-gray-200"></div>
        <p className="ml-3 text-brand-text">Checking access...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!userProfile?.is_admin) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_20px_44px_rgba(8,38,67,0.14)] rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-brand-text font-serif">Access denied</h1>
          <p className="text-slate-600 mt-2">
            This page is available to admin users only.
          </p>
          <Link
            to="/"
            className="inline-flex mt-6 px-5 py-2.5 rounded-full bg-brand-primary text-white font-medium hover:bg-brand-primary-dark transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export default AdminRoute;
