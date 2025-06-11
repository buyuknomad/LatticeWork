// src/components/Dashboard/BottomLine.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Zap } from 'lucide-react';

interface BottomLineProps {
  bottomLine: string;
  className?: string;
}

const BottomLine: React.FC<BottomLineProps> = ({ bottomLine, className = '' }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Background card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#252525]/80 to-[#1F1F1F]/80 backdrop-blur-xl rounded-xl border border-[#333333] hover:border-[#00FFFF]/30 transition-all duration-300">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0, 255, 255, 0.1) 10px,
              rgba(0, 255, 255, 0.1) 20px
            )`
          }} />
        </div>

        {/* Gradient glow effect */}
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.1) 0%, transparent 70%)'
          }}
        />

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="p-2.5 bg-gradient-to-br from-[#00FFFF]/20 to-[#8B5CF6]/20 rounded-xl"
              animate={{
                rotate: [0, -5, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Target className="h-5 w-5 text-[#00FFFF]" />
            </motion.div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                The Bottom Line
              </h3>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Zap className="h-3 w-3 text-[#8B5CF6]" />
              </motion.div>
            </div>
          </div>

          {/* Main takeaway text */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight text-white mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {bottomLine}
          </motion.p>

          {/* Call-to-action indicator */}
          <motion.div
            className="flex items-center gap-2 text-[#00FFFF]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-sm font-medium">Take action on this insight</span>
            <motion.div
              animate={{
                x: [0, 5, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </motion.div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-[#00FFFF]/20 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-[#8B5CF6]/20 rounded-br-xl" />
        </div>

        {/* Floating orbs effect */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 bg-[#00FFFF]/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8B5CF6]/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Mobile touch indicator */}
      <motion.div
        className="mt-4 text-center text-xs text-gray-500 sm:hidden"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      >
        Tap to explore your action plan ↓
      </motion.div>

      {/* Character count indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-8 right-0 text-xs text-gray-600">
          {bottomLine.split(' ').length} words | {bottomLine.length} chars
        </div>
      )}
    </motion.div>
  );
};

export default BottomLine;