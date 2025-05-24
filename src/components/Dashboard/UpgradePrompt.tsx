// src/components/Dashboard/UpgradePrompt.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpgradePrompt: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-gradient-to-r from-[#252525] to-[#2A2A2A] rounded-xl p-8 border border-[#333333] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full filter blur-3xl"></div>
      
      <div className="relative flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-[#8B5CF6]/10 rounded-full">
          <Crown className="h-12 w-12 text-[#8B5CF6]" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-3">
            Unlock Deeper Pattern Analysis
          </h3>
          <p className="text-gray-300 mb-4">
            Discover 3-4 mental models, 2-3 biases per pattern, see how they interconnect, and gain deeper understanding with Premium.
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="text-xs px-3 py-1 bg-[#333333] rounded-full text-gray-300">
              Unlimited Pattern Analysis
            </span>
            <span className="text-xs px-3 py-1 bg-[#333333] rounded-full text-gray-300">
              300+ Mental Models
            </span>
            <span className="text-xs px-3 py-1 bg-[#333333] rounded-full text-gray-300">
              246 Cognitive Biases
            </span>
          </div>
        </div>
        
        <Link to="/pricing">
          <motion.button
            className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Upgrade Now
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default UpgradePrompt;