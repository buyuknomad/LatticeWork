import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  const [isLoading, setIsLoading] = useState(true);
  const [authListenerInitialized, setAuthListenerInitialized] = useState(false);

  // Load the session once on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error loading session:', error);
          return;
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          console.log('Session loaded successfully');
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
  }, []);

  // Set up auth state change listener once session is loaded
  useEffect(() => {
    if (authListenerInitialized || isLoading) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`Auth event: ${event}`);
        
        // Skip redundant updates
        if (event === 'INITIAL_SESSION') return;
        
        // Update state based on session changes
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          console.log('User authenticated:', newSession.user.email);
        } else {
          setSession(null);
          setUser(null);
          console.log('User logged out');
        }
      }
    );
    
    setAuthListenerInitialized(true);
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [isLoading, authListenerInitialized]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    session,
    user,
    isLoading,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};