// src/components/Dashboard/LoadingState.tsx
import React from 'react';
import { motion } from 'framer-motion';

const LoadingState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto text-center py-20"
    >
      <div className="relative inline-flex">
        <div className="w-20 h-20 rounded-full border-t-2 border-b-2 border-[#00FFFF] animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#252525]"></div>
        </div>
      </div>
      <p className="mt-6 text-gray-400">Analyzing patterns and uncovering insights...</p>
      <p className="mt-2 text-sm text-gray-500">Identifying mental models and biases at play</p>
    </motion.div>
  );
};

export default LoadingState;