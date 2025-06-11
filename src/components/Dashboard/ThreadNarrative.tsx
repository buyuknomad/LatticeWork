// src/components/Dashboard/ThreadNarrative.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Layers, ChevronDown, Eye } from 'lucide-react';
import { ThreadedNarrative, RecommendedTool } from './types';
import NarrativeHook from './NarrativeHook';
import ThreadItem from './ThreadItem';
import ThreadTimeline from './ThreadTimeline';
import BottomLine from './BottomLine';
import ActionPlan from './ActionPlan';

interface ThreadNarrativeProps {
  narrative: ThreadedNarrative;
  tools: RecommendedTool[];
  className?: string;
  onToolClick?: (toolName: string) => void;
}

const ThreadNarrative: React.FC<ThreadNarrativeProps> = ({
  narrative,
  tools,
  className = '',
  onToolClick
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeThreadIndex, setActiveThreadIndex] = useState(-1);
  const [showFullNarrative, setShowFullNarrative] = useState(false);

  // Calculate tool counts
  const mentalModels = tools.filter(t => t.type === 'mental_model');
  const cognitiveBiases = tools.filter(t => t.type === 'cognitive_bias');
  const surpriseTools = tools.filter(t => t.isSurprise);

  // Auto-reveal threads progressively
  useEffect(() => {
    setIsVisible(true);
    
    // Progressive thread reveal
    const revealThreads = () => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < narrative.threads.length) {
          setActiveThreadIndex(currentIndex);
          currentIndex++;
        } else {
          clearInterval(interval);
          setShowFullNarrative(true);
        }
      }, 600); // Reveal a new thread every 600ms

      return () => clearInterval(interval);
    };

    const timer = setTimeout(revealThreads, 500);
    return () => clearTimeout(timer);
  }, [narrative.threads.length]);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tool Count Indicator Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-[#1F1F1F]/80 backdrop-blur-xl rounded-xl border border-[#333333] p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left side - Pattern Analysis label */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#8B5CF6]/20 to-[#00FFFF]/20 rounded-lg">
                <Layers className="h-5 w-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Pattern Analysis Narrative</h3>
                <p className="text-xs text-gray-400">
                  {narrative.threads.length} insights • ~3 min read
                </p>
              </div>
            </div>

            {/* Right side - Tool counts */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#00FFFF]/10 rounded-lg">
                  <Brain className="h-4 w-4 text-[#00FFFF]" />
                </div>
                <span className="text-sm text-gray-300">
                  {mentalModels.length} Models
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm text-gray-300">
                  {cognitiveBiases.length} Biases
                </span>
              </div>

              {surpriseTools.length > 0 && (
                <motion.div
                  className="flex items-center gap-2 px-3 py-1 bg-[#8B5CF6]/10 rounded-full border border-[#8B5CF6]/30"
                  animate={{
                    borderColor: ['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.6)', 'rgba(139, 92, 246, 0.3)']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-xs text-[#8B5CF6] font-medium">
                    ✨ {surpriseTools.length} Surprise
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-3 h-1 bg-[#252525] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]"
              initial={{ width: '0%' }}
              animate={{ 
                width: `${((activeThreadIndex + 1) / narrative.threads.length) * 100}%`
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Narrative Hook */}
      <NarrativeHook hook={narrative.hook} className="mb-12 text-center" />

      {/* Threads Container */}
      <div className="relative max-w-3xl mx-auto">
        {/* Timeline - only show on larger screens */}
        <div className="hidden sm:block">
          <ThreadTimeline 
            threadCount={narrative.threads.length} 
            activeIndex={activeThreadIndex}
            className="z-0"
          />
        </div>

        {/* Thread Items */}
        <div className="relative z-10 space-y-6 pl-0 sm:pl-16">
          <AnimatePresence>
            {narrative.threads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index <= activeThreadIndex ? 1 : 0.3,
                  scale: index <= activeThreadIndex ? 1 : 0.95
                }}
                transition={{ duration: 0.5 }}
              >
                <ThreadItem
                  thread={thread}
                  index={index}
                  totalThreads={narrative.threads.length}
                  onToolClick={onToolClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Line and Action Plan - Show after all threads */}
      <AnimatePresence>
        {showFullNarrative && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 space-y-8"
          >
            {/* Bottom Line */}
            <BottomLine bottomLine={narrative.bottomLine} />

            {/* Action Plan */}
            <ActionPlan actionPlan={narrative.actionPlan} />

            {/* Scroll indicator for mobile */}
            <motion.div
              className="text-center text-xs text-gray-500 sm:hidden pb-4"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <ChevronDown className="h-4 w-4 mx-auto" />
              <span>Scroll for more insights</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading completion indicator */}
      {showFullNarrative && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <Eye className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">Analysis complete</span>
          </div>
        </motion.div>
      )}

      {/* Debug info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded">
          <div>Active Thread: {activeThreadIndex + 1}/{narrative.threads.length}</div>
          <div>Show Full: {showFullNarrative ? 'Yes' : 'No'}</div>
        </div>
      )}
    </motion.div>
  );
};

export default ThreadNarrative;