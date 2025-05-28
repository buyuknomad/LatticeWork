// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ChevronLeft, AlertCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check for existing cooldown on component mount
  React.useEffect(() => {
    if (email) {
      const savedCooldownEnd = localStorage.getItem(`reset_cooldown_${email}`);
      if (savedCooldownEnd) {
        const endTime = parseInt(savedCooldownEnd);
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
        setResendCooldown(remainingSeconds);
      }
    }
  }, [email]);

  // Cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (email) {
      // Clear localStorage when cooldown ends
      localStorage.removeItem(`reset_cooldown_${email}`);
    }
  }, [resendCooldown, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || resendCooldown > 0) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Handle rate limit error
        if (error.message.includes('rate limit') || error.message.includes('60')) {
          setMessage({ text: 'Please wait 60 seconds between reset attempts.', type: 'error' });
          // Set cooldown
          const cooldownSeconds = 60;
          setResendCooldown(cooldownSeconds);
          localStorage.setItem(
            `reset_cooldown_${email}`, 
            (Date.now() + cooldownSeconds * 1000).toString()
          );
        } else if (error.message.includes('User not found')) {
          // Don't reveal if email exists for security
          handleSuccess();
        } else {
          throw error;
        }
        return;
      }

      handleSuccess();

    } catch (error: any) {
      console.error('Password reset error:', error);
      setMessage({ 
        text: 'Failed to send reset email. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setMessage({ 
      text: 'If an account exists with this email, you will receive a password reset link shortly.', 
      type: 'success' 
    });
    
    // Set cooldown
    const cooldownSeconds = 60;
    setResendCooldown(cooldownSeconds);
    localStorage.setItem(
      `reset_cooldown_${email}`, 
      (Date.now() + cooldownSeconds * 1000).toString()
    );
  };

  const isSubmitDisabled = !email || isLoading || resendCooldown > 0;

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#212327] rounded-2xl p-8 md:p-10"
      >
        {/* Back to login link */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-[#00FFFF] hover:underline mb-6 text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#00FFFF]/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-[#00FFFF]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-400 text-sm">
            Enter your email and we'll send you a reset link
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
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#2A2D35] text-white rounded-lg block w-full pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] placeholder-gray-500"
                placeholder="your.email@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-[#00FFFF] text-[#1A1A1A] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={!isSubmitDisabled ? { scale: 1.02 } : {}}
            whileTap={!isSubmitDisabled ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              'Send Reset Link'
            )}
          </motion.button>
        </form>

        {/* Additional help text */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder.
          </p>
          
          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-[#00FFFF] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;