// src/context/AuthContext.tsx
// Enhanced auth context with admin role management

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean; // New: admin status
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => boolean; // New: check admin status
}

// Admin configuration - centralized for easy management
const ADMIN_CONFIG = {
  emails: [
    'infiernodel@gmail.com',
    // Add more admin emails here
  ],
  roles: ['admin', 'super_admin'],
  // You can also add user IDs if needed
  userIds: [
    '7afaef73-ce6d-426a-b4d7-b04fd6b0edc2', // infiernodel@gmail.com
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if a user is an admin
  const checkAdminStatus = (currentUser?: User | null): boolean => {
    const userToCheck = currentUser || user;
    
    if (!userToCheck) return false;

    // Check by email
    if (ADMIN_CONFIG.emails.includes(userToCheck.email || '')) {
      return true;
    }

    // Check by user ID
    if (ADMIN_CONFIG.userIds.includes(userToCheck.id)) {
      return true;
    }

    // Check by role in user metadata
    const userRole = userToCheck.user_metadata?.role || userToCheck.app_metadata?.role;
    if (userRole && ADMIN_CONFIG.roles.includes(userRole)) {
      return true;
    }

    // Optional: Check against a database table (uncomment if you have an admin table)
    // This would be an async check, so you'd need to handle it differently
    /*
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userToCheck.id)
      .single();
    return !!data;
    */

    return false;
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setIsAdmin(checkAdminStatus(session.user));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setIsAdmin(checkAdminStatus(session?.user || null));
        
        // Log admin access for security monitoring
        if (session?.user && checkAdminStatus(session.user)) {
          console.log(`Admin access: ${session.user.email} at ${new Date().toISOString()}`);
          
          // Optional: Track admin access in database
          try {
            await supabase.from('admin_access_logs').insert({
              user_id: session.user.id,
              email: session.user.email,
              action: event,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            // Silently fail if table doesn't exist
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Check admin status after sign in
    if (data.user) {
      setIsAdmin(checkAdminStatus(data.user));
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    checkAdminStatus: () => checkAdminStatus(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export admin config for use in other components
export { ADMIN_CONFIG };