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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      console.log('Successfully signed out');
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
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