//src/context/AuthContext.tsx


import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { analytics } from '../services/analytics';
import { GA_EVENTS, GA_CATEGORIES } from '../constants/analytics';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial session
    const loadSession = async (): Promise<void> => {
      try {
        console.log('Loading initial session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error loading session:', error);
          return;
        }
        
        if (data?.session) {
          console.log('Initial session found:', data.session.user.email);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log('No active session found');
        }
      } catch (err) {
        console.error('Unexpected error loading session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`Auth event [${event}]:`, newSession ? `User ${newSession.user.email}` : 'No session');
        
        // Track auth events
        if (event === 'SIGNED_IN' && newSession) {
          analytics.setUserId(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          analytics.setUserId(null);
        } else if (event === 'USER_UPDATED' && newSession) {
          analytics.trackEvent(
            GA_CATEGORIES.AUTH,
            'user_updated',
            'profile_update'
          );
        }
        
        // Update state based on session changes
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      console.log('Attempting to sign out');
      setIsLoading(true);
      
      // Check if there's actually a session to sign out from
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('No active session to sign out from');
        // Clear local state anyway
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // If error is about missing session, just clear local state
        if (error.message.includes('session') || error.message.includes('Session')) {
          console.log('Session already expired, clearing local state');
          setSession(null);
          setUser(null);
        } else {
          console.error('Error signing out:', error);
          throw error;
        }
      } else {
        console.log('Successfully signed out');
        
        // Track successful logout
        analytics.trackEvent(
          GA_CATEGORIES.AUTH,
          GA_EVENTS.AUTH.LOGOUT,
          'manual_logout'
        );
        analytics.setUserId(null); // Clear user ID
        
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      // Even on error, clear local state to ensure user can "sign out"
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};