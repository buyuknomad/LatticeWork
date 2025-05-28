import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LocationState {
  email?: string;
}

const SignupSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const email = state?.email || 'your email';
  
  // Resend functionality states
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Initialize cooldown from localStorage (set during signup)
  React.useEffect(() => {
    const savedCooldownEnd = localStorage.getItem(`resend_cooldown_${email}`);
    if (savedCooldownEnd) {
      const endTime = parseInt(savedCooldownEnd);
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.ceil((endTime - now) / 1000));
      setResendCooldown(remainingSeconds);
    }
    // If no cooldown found, they can resend immediately (edge case: old signup or direct navigation)
  }, [email]);

  // Cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Clear localStorage when cooldown ends
      localStorage.removeItem(`resend_cooldown_${email}`);
    }
  }, [resendCooldown, email]);

  const handleResendEmail = async () => {
    if (!state?.email || resendCooldown > 0) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.email,
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
            `resend_cooldown_${state.email}`, 
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
        `resend_cooldown_${state.email}`, 
        (Date.now() + cooldownSeconds * 1000).toString()
      );
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResendMessage(null), 5000);
      
    } catch (error: any) {
      console.error('Error resending email:', error);
      setResendMessage('Failed to send email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#212327] rounded-2xl p-8 md:p-10 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-[#00FFFF]/10 rounded-full flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-[#00FFFF]" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Check Your Email
        </h1>
        
        <p className="text-gray-300 mb-6">
          We've sent a confirmation link to<br />
          <span className="text-[#00FFFF] font-medium">{email}</span>
        </p>
        
        <p className="text-gray-400 mb-8 text-sm">
          Please check your inbox and click the confirmation link to complete your registration.
        </p>

        {/* Resend Message */}
        {resendMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-3 rounded-lg flex items-center justify-center gap-2 ${
              resendMessage.includes('sent') 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {resendMessage.includes('sent') && <CheckCircle className="h-4 w-4" />}
            <span className="text-sm">{resendMessage}</span>
          </motion.div>
        )}
        
        <div className="space-y-4">
          {/* Resend Button */}
          <motion.button
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0 || !state?.email}
            className="w-full bg-[#333333] text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#404040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                Resend Confirmation Email
              </>
            )}
          </motion.button>
          
          {/* Additional Help Text */}
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
          
          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-[#2A2D35] text-white py-3 px-4 rounded-lg border border-[#333333] hover:border-[#00FFFF]/50 transition-colors"
            >
              Return to Login
            </motion.button>
            
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="mt-3 text-gray-400 hover:text-[#00FFFF] text-sm transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupSuccessPage;