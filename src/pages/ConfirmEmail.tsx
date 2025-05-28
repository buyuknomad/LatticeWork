import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const ConfirmEmail: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Supabase handles the confirmation automatically via the URL
        // We just need to check if the user is now logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to dashboard...');
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Invalid or expired confirmation link.');
        }
        
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('Failed to confirm email. Please try again.');
      }
    };

    confirmEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#212327] rounded-2xl p-8 text-center"
      >
        {status === 'loading' && (
          <>
            <Loader className="h-12 w-12 text-[#00FFFF] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-white">Confirming your email...</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Email Confirmed!</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Confirmation Failed</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="text-[#00FFFF] hover:underline"
            >
              Go to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ConfirmEmail;