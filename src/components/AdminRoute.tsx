// src/components/AdminRoute.tsx
// Protected route component for admin-only pages

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  allowedEmails?: string[]; // Optional: specific emails allowed
  allowedRoles?: string[]; // Optional: specific roles allowed
  redirectTo?: string; // Where to redirect non-admins
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  allowedEmails = ['infiernodel@gmail.com'], // Add more admin emails here
  allowedRoles = ['admin', 'super_admin'],
  redirectTo = '/dashboard'
}) => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#00FFFF] mx-auto mb-4 animate-pulse" />
          <p className="text-white">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: '/admin/analytics' }} replace />;
  }

  // Check if user is admin
  const isAdmin = 
    allowedEmails.includes(user.email || '') ||
    allowedRoles.includes(user.user_metadata?.role) ||
    allowedRoles.includes(user.app_metadata?.role);

  // If not admin, show access denied or redirect
  if (!isAdmin) {
    // Option 1: Show access denied page (better UX)
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="block w-full px-6 py-3 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
            >
              Go Back
            </button>
            <a
              href={redirectTo}
              className="block w-full px-6 py-3 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            If you believe you should have access, contact your administrator.
          </p>
        </div>
      </div>
    );

    // Option 2: Silent redirect (uncomment if preferred)
    // return <Navigate to={redirectTo} replace />;
  }

  // User is admin, render children
  return <>{children}</>;
};

export default AdminRoute;