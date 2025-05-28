import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    checkEmailVerification();
  }, [user]);

  // Initialize cooldown from localStorage
  React.useEffect(() => {
    if (user?.email) {
      const savedCooldownEnd = localStorage.getItem(`resend_cooldown_${user.email}`);
      if (savedCooldownEnd) {
        const endTime = parseInt(savedCooldownEnd);
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
        setResendCooldown(remainingSeconds);
      }
    }
  }, [user?.email]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (user?.email) {
      // Clear localStorage when cooldown ends
      localStorage.removeItem(`resend_cooldown_${user.email}`);
    }
  }, [resendCooldown, user?.email]);

  const checkEmailVerification = async () => {
    if (!user) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser && !currentUser.email_confirmed_at) {
      setShowBanner(true);
      
      // Check if banner was previously dismissed this session
      const dismissed = sessionStorage.getItem('email-verification-dismissed');
      if (dismissed === 'true') {
        setShowBanner(false);
      }
    } else {
      setShowBanner(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email || resendCooldown > 0) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      });

      if (error) {
        // Handle Supabase rate limit error
        if (error.message.includes('rate limit') || error.message.includes('60')) {
          setResendMessage('Please wait 60 seconds between resend attempts.');
          // Try to sync with Supabase's cooldown
          const cooldownSeconds = 60;
          setResendCooldown(cooldownSeconds);
          localStorage.setItem(
            `resend_cooldown_${user.email}`, 
            (Date.now() + cooldownSeconds * 1000).toString()
          );
        } else {
          throw error;
        }
        return;
      }

      setResendMessage('Verification email sent! Check your inbox.');
      
      // Set cooldown and save to localStorage
      const cooldownSeconds = 60;
      setResendCooldown(cooldownSeconds);
      localStorage.setItem(
        `resend_cooldown_${user.email}`, 
        (Date.now() + cooldownSeconds * 1000).toString()
      );
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResendMessage(null), 5000);
      
    } catch (error: any) {
      console.error('Error resending email:', error);
      setResendMessage('Failed to send email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('email-verification-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-0 right-0 z-50 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 backdrop-blur-lg rounded-lg border border-amber-500/30 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">
                      Verify your email address
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      We sent a verification email to <span className="font-medium text-white">{user?.email}</span>. 
                      Please check your inbox and click the confirmation link.
                    </p>
                    
                    {resendMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm mb-3 ${
                          resendMessage.includes('sent') ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {resendMessage}
                      </motion.p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={handleResendEmail}
                        disabled={isResending || resendCooldown > 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isResending ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : resendCooldown > 0 ? (
                          <>
                            <Mail className="h-4 w-4" />
                            Resend in {resendCooldown}s
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            Resend Email
                          </>
                        )}
                      </motion.button>
                      
                      <span className="text-gray-500 text-sm">
                        Didn't receive it? Check your spam folder
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Dismiss"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailVerificationBanner;