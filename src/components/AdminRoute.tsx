// src/components/AdminRoute.tsx
// Fixed to work with your existing AuthContext structure

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const { user, isLoading } = useAuth(); // Changed from 'loading' to 'isLoading'
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // If no user after loading is complete, mark check as done
    if (!user) {
      setAdminCheckComplete(true);
      return;
    }

    // Check admin status
    const checkAdminStatus = () => {
      // Get user email - could be in different places for Google OAuth
      const userEmail = user.email || user.user_metadata?.email || '';
      
      console.log('Admin check:', {
        userEmail,
        userId: user.id,
        metadata: user.user_metadata,
        appMetadata: user.app_metadata
      });
      
      // Check if user is admin by email (case-insensitive)
      const emailIsAdmin = allowedEmails.some(
        adminEmail => adminEmail.toLowerCase() === userEmail.toLowerCase()
      );
      
      // Check if user is admin by role
      const roleIsAdmin = 
        allowedRoles.includes(user.user_metadata?.role) ||
        allowedRoles.includes(user.app_metadata?.role) ||
        false;

      const adminStatus = emailIsAdmin || roleIsAdmin;
      
      console.log('Admin check result:', {
        email: userEmail,
        emailIsAdmin,
        roleIsAdmin,
        finalIsAdmin: adminStatus
      });

      setIsAdmin(adminStatus);
      setAdminCheckComplete(true);
    };

    checkAdminStatus();
  }, [user, isLoading, allowedEmails, allowedRoles]);

  // Show loading state while checking auth
  if (isLoading || !adminCheckComplete) {
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
    console.log('No user found, redirecting to login from:', location.pathname);
    // Store the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If not admin, show access denied
  if (!isAdmin) {
    const userEmail = user.email || user.user_metadata?.email || 'Unknown';
    console.log(`Access denied for user: ${userEmail}`);
    
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          <div className="bg-[#252525] rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">Logged in as:</p>
            <p className="text-sm text-white font-mono">{userEmail}</p>
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
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
              <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-400 overflow-auto">
{JSON.stringify({
  allowedEmails,
  userEmail,
  userId: user.id,
  provider: user.app_metadata?.provider
}, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // User is admin, render children
  console.log('Admin access granted, rendering protected content');
  return <>{children}</>;
};

export default AdminRoute;