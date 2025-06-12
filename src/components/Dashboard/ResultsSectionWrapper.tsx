// src/components/Dashboard/ThreadNarrativeSafe.tsx
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

const ThreadNarrativeSafe: React.FC<ThreadNarrativeProps> = ({
  narrative,
  tools,
  className = '',
  onToolClick
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeThreadIndex, setActiveThreadIndex] = useState(-1);
  const [showFullNarrative, setShowFullNarrative] = useState(false);

  // Validate narrative structure
  if (!narrative || typeof narrative !== 'object') {
    console.error('ThreadNarrativeSafe: Invalid narrative structure', narrative);
    return (
      <div className="text-center py-16">
        <p className="text-red-400">Error: Invalid narrative structure</p>
      </div>
    );
  }

  // Ensure threads is an array
  const threads = Array.isArray(narrative.threads) ? narrative.threads : [];
  
  if (threads.length === 0) {
    console.error('ThreadNarrativeSafe: No threads found', narrative);
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No narrative threads available</p>
      </div>
    );
  }

  // Ensure tools is an array with null safety
  const safeTools = Array.isArray(tools) ? tools : [];
  const mentalModels = safeTools.filter(t => t?.type === 'mental_model') || [];
  const cognitiveBiases = safeTools.filter(t => t?.type === 'cognitive_bias') || [];
  const surpriseTools = safeTools.filter(t => t?.isSurprise) || [];

  // Validate other required properties
  const hook = narrative.hook || 'Analysis of your query...';
  const bottomLine = narrative.bottomLine || 'Take action on these insights.';
  const actionPlan = narrative.actionPlan || { type: 'analytical', sections: {} };

  // Auto-reveal threads progressively
  useEffect(() => {
    setIsVisible(true);
    
    // Progressive thread reveal
    const revealThreads = () => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < threads.length) {
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
  }, [threads.length]);

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
                  {threads.length} insights • ~3 min read
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
                width: `${((activeThreadIndex + 1) / threads.length) * 100}%`
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Narrative Hook */}
      <NarrativeHook hook={hook} className="mb-12 text-center" />

      {/* Threads Container */}
      <div className="relative max-w-3xl mx-auto">
        {/* Timeline - only show on larger screens */}
        <div className="hidden sm:block">
          <ThreadTimeline 
            threadCount={threads.length} 
            activeIndex={activeThreadIndex}
            className="z-0"
          />
        </div>

        {/* Thre