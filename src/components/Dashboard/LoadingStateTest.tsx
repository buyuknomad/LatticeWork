// src/components/Dashboard/LoadingStateTest.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Globe, Sparkles } from 'lucide-react';

const LoadingStateTest: React.FC = () => {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const phases = [
    { icon: Brain, text: "Analyzing patterns and uncovering insights...", subtext: "Identifying mental models and biases at play" },
    { icon: Globe, text: "Searching for current information...", subtext: "Enhancing analysis with real-time context" },
    { icon: Sparkles, text: "Generating comprehensive narrative...", subtext: "Weaving insights into a cohesive story" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingPhase((prev) => (prev + 1) % phases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = phases[loadingPhase].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto text-center py-20"
    >
      <div className="relative inline-flex mb-8">
        {/* Animated rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#00FFFF]/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#8B5CF6]/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Main loader */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-t-2 border-b-2 border-[#00FFFF] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              key={loadingPhase}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center"
            >
              <CurrentIcon className="h-6 w-6 text-[#00FFFF]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Phase indicator dots */}
      <div className="flex justify-center gap-2 mb-6">
        {phases.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === loadingPhase 
                ? 'w-8 bg-[#00FFFF]' 
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Loading text */}
      <motion.div
        key={loadingPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-400 mb-2">{phases[loadingPhase].text}</p>
        <p className="text-sm text-gray-500">{phases[loadingPhase].subtext}</p>
      </motion.div>

      {/* Progress indicator */}
      <div className="mt-8 max-w-xs mx-auto">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 10,
              ease: "linear",
              repeat: Infinity
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingStateTest;