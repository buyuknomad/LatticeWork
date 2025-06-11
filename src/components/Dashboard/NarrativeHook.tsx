// src/components/Dashboard/NarrativeHook.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Quote } from 'lucide-react';

interface NarrativeHookProps {
  hook: string;
  className?: string;
}

const NarrativeHook: React.FC<NarrativeHookProps> = ({ hook, className = '' }) => {
  // Split hook into words for animated appearance
  const words = hook.split(' ');

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -m-4">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#00FFFF]/10 to-transparent rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#8B5CF6]/10 to-transparent rounded-full filter blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Opening quote decoration */}
        <motion.div
          className="absolute -left-6 -top-2 text-[#00FFFF]/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Quote className="h-8 w-8 rotate-180" />
        </motion.div>

        {/* Hook text with word-by-word animation */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-center px-4">
          {words.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block mr-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: "easeOut"
              }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white hover:from-[#00FFFF] hover:to-[#8B5CF6] transition-all duration-500 cursor-default">
                {word}
              </span>
            </motion.span>
          ))}
        </h2>

        {/* Closing quote decoration */}
        <motion.div
          className="absolute -right-6 -bottom-2 text-[#8B5CF6]/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Quote className="h-8 w-8" />
        </motion.div>

        {/* Animated underline */}
        <motion.div
          className="relative mt-4 mx-auto"
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        >
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent" />
          
          {/* Sparkle effects at the ends */}
          <motion.div
            className="absolute -left-2 -top-1"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="h-4 w-4 text-[#00FFFF]" />
          </motion.div>
          
          <motion.div
            className="absolute -right-2 -top-1"
            animate={{
              scale: [0, 1, 0],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
          </motion.div>
        </motion.div>

        {/* Mobile-optimized indicator */}
        <motion.div
          className="mt-6 flex justify-center sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-gray-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Character count indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-8 right-0 text-xs text-gray-600">
          {hook.split(' ').length} words | {hook.length} chars
        </div>
      )}
    </motion.div>
  );
};

export default NarrativeHook;