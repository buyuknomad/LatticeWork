// src/pages/CheckoutSuccess.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to dashboard after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/dashboard?upgrade=success');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#212327] rounded-2xl p-8 md:p-10 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Premium!
        </h1>
        
        <p className="text-gray-300 mb-6">
          Your subscription has been activated successfully. You now have access to all premium features.
        </p>
        
        <div className="animate-pulse text-gray-400 text-sm">
          Redirecting to dashboard...
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;