// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // Check if we have a valid session from the reset link
  useEffect(() => {
    checkResetToken();
  }, []);

  const checkResetToken = async () => {
    try {
      // Check if there's a session (which means the reset token was valid)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        setMessage({ 
          text: 'Invalid or expired reset link. Please request a new one.', 
          type: 'error' 
        });
        setIsValidToken(false);
      } else if (session) {
        // Valid reset token
        setIsValidToken(true);
      } else {
        // No session, invalid token
        setMessage({ 
          text: 'Invalid or expired reset link. Please request a new one.', 
          type: 'error' 
        });
        setIsValidToken(false);
      }
    } catch (error) {
      console.error('Error checking reset token:', error);
      setMessage({ 
        text: 'An error occurred. Please try again.', 
        type: 'error' 
      });
      setIsValidToken(false);
    } finally {
      setCheckingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Sign out the user after password reset for security
      await supabase.auth.signOut();

      setMessage({ 
        text: 'Password reset successful! Redirecting to login...', 
        type: 'success' 
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful. Please sign in with your new password.' } 
        });
      }, 2000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      setMessage({ 
        text: error.message || 'Failed to reset password. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Show loading state while checking token
  if (checkingToken) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#212327] rounded-2xl p-8 md:p-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#00FFFF]/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-[#00FFFF]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Set New Password
          </h1>
          <p className="text-gray-400 text-sm">
            {isValidToken 
              ? 'Choose a strong password for your account' 
              : 'Reset link has expired or is invalid'}
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}

        {isValidToken ? (
          /* Password Reset Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-gray-300 text-sm mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] placeholder-gray-500"
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-300 text-sm mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] placeholder-gray-500"
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full bg-[#00FFFF] text-[#1A1A1A] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </motion.button>
          </form>
        ) : (
          /* Invalid Token Display */
          <div className="text-center">
            <p className="text-gray-400 mb-6">
              The password reset link you clicked is invalid or has expired. 
              Please request a new password reset link.
            </p>
            <motion.button
              onClick={navigateToForgotPassword}
              className="w-full bg-[#333333] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#404040] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Request New Reset Link
            </motion.button>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#00FFFF] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;