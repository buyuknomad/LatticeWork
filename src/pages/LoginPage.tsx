// src/pages/LoginPage.tsx
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthError } from '@supabase/supabase-js';

interface LocationState {
  message?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from password reset
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Login successful:', data.user?.email);
      // Successful login
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const authError = error as AuthError;
      
      // Provide more helpful error messages
      if (authError.message.includes('Invalid login credentials')) {
        setErrorMessage('Invalid email or password. Please try again.');
      } else if (authError.message.includes('Email not confirmed')) {
        setErrorMessage('Please confirm your email before signing in.');
      } else {
        setErrorMessage(authError.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log('Attempting Google login');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      // No need to navigate here as OAuth will redirect automatically
    } catch (error) {
      console.error('Google login error:', error);
      const authError = error as AuthError;
      setErrorMessage(authError.message || 'Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const navigateToSignUp = (): void => {
    navigate('/signup');
  };

  const navigateToForgotPassword = (): void => {
    navigate('/forgot-password');
  };

  return (
    <>
      <SEO
        title="Login - Access Your Mental Models Dashboard"
        description="Sign in to Mind Lattice to access your personalized mental models and cognitive bias analysis. Continue improving your decision-making."
        keywords="mind lattice login, mental models dashboard, sign in"
        url="/login"
      />
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm bg-[#212327] rounded-xl p-5 sm:p-6"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome to <span className="text-[#00FFFF]">Mind Lattice</span>
            </h1>
            <p className="text-gray-400 text-sm mb-8">Sign in to continue</p>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-start gap-2"
            >
              <span>✓</span>
              <span>{successMessage}</span>
            </motion.div>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-xs"
            >
              {errorMessage}
            </motion.div>
          )}
          
          {/* Google Sign In Button - Moved to top with better styling */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 transition-colors font-medium shadow-sm"
            disabled={isLoading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </motion.button>
          
          {/* OR Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-3 text-gray-400 text-xs uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-gray-300 text-sm mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="bg-[#2A2D35] text-white rounded-lg block w-full pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-gray-300 text-sm">Password</label>
                <button
                  type="button"
                  onClick={navigateToForgotPassword}
                  className="text-[#00FFFF] text-xs hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="bg-[#2A2D35] text-white rounded-lg block w-full pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#4661E6] text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'} 
              {!isLoading && <span>→</span>}
            </motion.button>
          </form>
          
          <p className="mt-6 text-center text-gray-400 text-xs">
            Don't have an account?{' '}
            <button
              onClick={navigateToSignUp}
              className="text-[#00FFFF] hover:underline"
              type="button"
            >
              Sign Up
            </button>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;