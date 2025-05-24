// src/components/Dashboard/ToolCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Eye, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { RecommendedTool } from './types';

interface ToolCardProps {
  tool: RecommendedTool;
  index: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMentalModel = tool.type === 'mental_model';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group"
    >
      <div
        className={`relative bg-[#252525]/80 backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-hidden ${
          isMentalModel 
            ? 'border-[#00FFFF]/20 hover:border-[#00FFFF]/40 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]' 
            : 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
        }`}
      >
        {/* Card Glow Effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isMentalModel 
            ? 'bg-gradient-to-br from-[#00FFFF]/5 via-transparent to-[#00FFFF]/5' 
            : 'bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5'
        }`}></div>

        {/* Card Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isMentalModel ? (
                  <div className="p-2 bg-[#00FFFF]/10 rounded-lg">
                    <Brain className="h-5 w-5 text-[#00FFFF]" />
                  </div>
                ) : (
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isMentalModel 
                    ? 'bg-[#00FFFF]/10 text-[#00FFFF]' 
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {tool.category}
                </span>
                <span className="text-xs text-gray-500">
                  {isMentalModel ? 'Mental Model' : 'Cognitive Bias'}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {tool.summary}
          </p>

          {/* Explanation Section */}
          <div className="border-t border-[#333333] pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-full flex items-center justify-between p-3 -m-3 rounded-lg transition-colors ${
                isMentalModel 
                  ? 'hover:bg-[#00FFFF]/5' 
                  : 'hover:bg-amber-500/5'
              }`}
            >
              <span className={`text-sm font-medium flex items-center gap-2 ${
                isMentalModel ? 'text-[#00FFFF]' : 'text-amber-500'
              }`}>
                <Eye size={16} />
                How this explains the pattern
              </span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 pl-1">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {tool.explanation || "No specific explanation provided."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Learn More Button */}
          <div className="mt-4 flex justify-end">
            <button className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all ${
              isMentalModel 
                ? 'text-[#00FFFF] hover:bg-[#00FFFF]/10' 
                : 'text-amber-500 hover:bg-amber-500/10'
            }`}>
              Learn More
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ToolCard;