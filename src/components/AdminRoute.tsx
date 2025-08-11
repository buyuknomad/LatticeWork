// src/components/AdminRoute.tsx
// Fixed version that works with Google OAuth and Supabase Auth

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // If still loading auth, wait
      if (loading) {
        return;
      }

      // If no user, we'll handle redirect below
      if (!user) {
        setIsChecking(false);
        return;
      }

      // For Google OAuth users, the email might be in different places
      const userEmail = user.email || user.user_metadata?.email || '';
      
      console.log('Admin check - User email:', userEmail);
      console.log('Admin check - User ID:', user.id);
      console.log('Admin check - User metadata:', user.user_metadata);
      
      // Check if user is admin by email
      const emailIsAdmin = allowedEmails.includes(userEmail.toLowerCase());
      
      // Check if user is admin by role (if you have roles set up)
      const roleIsAdmin = 
        allowedRoles.includes(user.user_metadata?.role) ||
        allowedRoles.includes(user.app_metadata?.role) ||
        false;

      // Set admin status
      setIsAdmin(emailIsAdmin || roleIsAdmin);
      setIsChecking(false);

      // Log the result for debugging
      console.log('Admin check result:', {
        email: userEmail,
        emailIsAdmin,
        roleIsAdmin,
        finalIsAdmin: emailIsAdmin || roleIsAdmin
      });
    };

    checkAdminStatus();
  }, [user, loading, allowedEmails, allowedRoles]);

  // Show loading state while checking auth
  if (loading || isChecking) {
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
    console.log('No user found, redirecting to login');
    // Store the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If not admin, show access denied
  if (!isAdmin) {
    console.log('User is not admin, showing access denied');
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Logged in as: {user.email || user.user_metadata?.email || 'Unknown'}
          </div>
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
  }

  // User is admin, render children
  console.log('User is admin, rendering protected content');
  return <>{children}</>;
};

export default AdminRoute;