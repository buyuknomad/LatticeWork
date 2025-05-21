import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const SignupSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email';

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
        
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full bg-[#2A2D35] text-white py-3 px-4 rounded-lg border border-[#333333] hover:border-[#00FFFF]/50 transition-colors"
          >
            Return to Login
          </motion.button>
          
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-[#00FFFF] text-sm transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupSuccessPage;