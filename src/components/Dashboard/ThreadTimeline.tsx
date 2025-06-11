// src/components/Dashboard/ThreadTimeline.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ThreadTimelineProps {
  threadCount: number;
  activeIndex?: number;
  className?: string;
}

const ThreadTimeline: React.FC<ThreadTimelineProps> = ({ 
  threadCount, 
  activeIndex = -1,
  className = '' 
}) => {
  // Calculate timeline height based on thread count
  // Approximate height per thread (adjust based on actual thread heights)
  const estimatedThreadHeight = 140; // pixels
  const timelineHeight = threadCount * estimatedThreadHeight;

  return (
    <div className={`absolute left-8 top-0 ${className}`} style={{ height: `${timelineHeight}px` }}>
      {/* Main timeline gradient line */}
      <motion.div
        className="absolute left-0 top-8 bottom-8 w-0.5"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background: 'linear-gradient(to bottom, #00FFFF, #8B5CF6)',
          transformOrigin: 'top'
        }}
      />

      {/* Animated glow effect */}
      <motion.div
        className="absolute left-0 top-8 bottom-8 w-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: 'linear-gradient(to bottom, #00FFFF, #8B5CF6)',
          filter: 'blur(4px)',
          transformOrigin: 'top'
        }}
      />

      {/* Progress indicator (if activeIndex is provided) */}
      {activeIndex >= 0 && (
        <motion.div
          className="absolute left-[-2px] w-1"
          initial={{ height: 0 }}
          animate={{ 
            height: `${(activeIndex + 1) * estimatedThreadHeight}px`,
            transition: { duration: 0.5, ease: "easeOut" }
          }}
          style={{
            background: 'linear-gradient(to bottom, #00FFFF, #8B5CF6)',
            filter: 'brightness(1.5)',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
          }}
        />
      )}

      {/* Thread position dots */}
      {Array.from({ length: threadCount }).map((_, index) => {
        const topPosition = index * estimatedThreadHeight + 40; // Adjust for alignment
        const progress = index / (threadCount - 1);
        
        // Interpolate color based on position
        const r = Math.round(0 + (139 - 0) * progress);
        const g = Math.round(255 + (92 - 255) * progress);
        const b = Math.round(255 + (246 - 255) * progress);
        const dotColor = `rgb(${r}, ${g}, ${b})`;

        return (
          <motion.div
            key={index}
            className="absolute w-4 h-4 rounded-full border-2 border-[#1F1F1F]"
            style={{
              left: '-6px',
              top: `${topPosition}px`,
              backgroundColor: dotColor
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              ease: "backOut"
            }}
          >
            {/* Active dot indicator */}
            {index === activeIndex && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundColor: dotColor,
                  filter: 'blur(4px)'
                }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Floating particles effect */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: '0px',
            background: i % 2 === 0 ? '#00FFFF' : '#8B5CF6',
            filter: 'blur(1px)'
          }}
          animate={{
            y: [-20, timelineHeight + 20],
            opacity: [0, 1, 1, 0],
            x: [-2, 2, -2]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 2,
            ease: "linear"
          }}
        />
      ))}

      {/* Mobile simplified version indicator */}
      <div className="sm:hidden absolute -left-2 top-0 bottom-0 w-8 bg-gradient-to-b from-cyan-500/5 to-purple-500/5 rounded-full" />
    </div>
  );
};

export default ThreadTimeline;