// src/components/Dashboard/ToolCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Eye, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RecommendedTool } from './types';

interface ToolCardProps {
  tool: RecommendedTool;
  index: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMentalModel = tool.type === 'mental_model';
  
  // Custom markdown components for consistent styling
  const markdownComponents = {
    p: ({ children }: any) => (
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    ),
    strong: ({ children }: any) => (
      <strong className={`font-semibold ${
        isMentalModel ? 'text-[#00FFFF]' : 'text-amber-400'
      }`}>{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="text-gray-300 italic">{children}</em>
    ),
    code: ({ children }: any) => (
      <code className="px-1.5 py-0.5 bg-[#333333] text-gray-300 rounded text-xs font-mono">{children}</code>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-1 text-gray-400 text-sm">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-gray-400">
        <span className="text-gray-400">{children}</span>
      </li>
    ),
  };

  // Process markdown text to handle various syntax
  const processMarkdown = (text: string): string => {
    if (!text) return text;
    
    // Debug logging - remove after fixing the issue
    console.log('Original text:', text);
    
    // First, protect already doubled asterisks by temporarily replacing them
    let processed = text.replace(/\*\*/g, '%%DOUBLE%%');
    
    // Convert single asterisks to double
    processed = processed.replace(/\*/g, '**');
    
    // Restore the original double asterisks
    processed = processed.replace(/%%DOUBLE%%/g, '**');
    
    console.log('Processed text:', processed);
    
    return processed;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated glow effect on hover */}
      <motion.div
        className={`absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 ${
          isMentalModel 
            ? 'bg-gradient-to-r from-[#00FFFF] to-[#00FFFF]/50' 
            : 'bg-gradient-to-r from-amber-500 to-amber-500/50'
        }`}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
      />
      
      <div
        className={`relative h-full bg-[#1F1F1F]/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden ${
          isMentalModel 
            ? 'border-[#00FFFF]/20 hover:border-[#00FFFF]/40' 
            : 'border-amber-500/20 hover:border-amber-500/40'
        }`}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
          isMentalModel 
            ? 'bg-gradient-to-br from-[#00FFFF]/5 via-transparent to-[#00FFFF]/5' 
            : 'bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5'
        }`}>
          {/* Moving particles effect */}
          <div className="absolute inset-0">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${
                  isMentalModel ? 'bg-[#00FFFF]/40' : 'bg-amber-500/40'
                }`}
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%'
                }}
                animate={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                transition={{
                  duration: 10 + i * 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear'
                }}
              />
            ))}
          </div>
        </div>

        {/* Card Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  className={`relative p-2.5 rounded-xl ${
                    isMentalModel 
                      ? 'bg-gradient-to-br from-[#00FFFF]/20 to-[#00FFFF]/10' 
                      : 'bg-gradient-to-br from-amber-500/20 to-amber-500/10'
                  }`}
                  animate={{ 
                    rotate: isHovered ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {isMentalModel ? (
                    <Brain className="h-5 w-5 text-[#00FFFF]" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  
                  {/* Pulse effect on icon */}
                  <motion.div
                    className={`absolute inset-0 rounded-xl ${
                      isMentalModel ? 'bg-[#00FFFF]/20' : 'bg-amber-500/20'
                    }`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                
                <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {tool.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <motion.span 
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isMentalModel 
                      ? 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/20' 
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {tool.category}
                </motion.span>
              </div>
            </div>
          </div>

          {/* TEST: Remove this after debugging */}
          <div className="mb-4 p-2 bg-red-900/20 border border-red-500 rounded">
            <p className="text-xs text-red-400 mb-1">ReactMarkdown Test:</p>
            <ReactMarkdown
              components={{
                strong: ({ children }: any) => <strong className="text-red-500 font-bold">{children}</strong>
              }}
            >
              {'This should be **bold** and this should be *italic*'}
            </ReactMarkdown>
          </div>

          {/* Summary with markdown support */}
          <div className="mb-6">
            <ReactMarkdown
              components={{
                p: ({ children }: any) => (
                  <p className="text-gray-300 text-sm leading-relaxed">{children}</p>
                ),
                strong: ({ children }: any) => (
                  <strong className="font-semibold text-gray-100">{children}</strong>
                ),
                em: ({ children }: any) => (
                  <em className="text-gray-300 italic">{children}</em>
                ),
                code: ({ children }: any) => (
                  <code className="px-1 py-0.5 bg-[#333333] text-gray-300 rounded text-xs font-mono">{children}</code>
                ),
              }}
            >
              {processMarkdown(tool.summary)}
            </ReactMarkdown>
          </div>

          {/* Explanation Section - Redesigned with Markdown Support */}
          <div className={`border-t pt-4 transition-colors duration-300 ${
            isExpanded ? 'border-[#444444]' : 'border-[#333333]'
          }`}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-full flex items-center justify-between p-3 -m-3 rounded-xl transition-all duration-300 ${
                isMentalModel 
                  ? 'hover:bg-[#00FFFF]/5' 
                  : 'hover:bg-amber-500/5'
              }`}
            >
              <span className={`text-sm font-medium flex items-center gap-2 ${
                isMentalModel ? 'text-[#00FFFF]' : 'text-amber-500'
              }`}>
                <motion.div
                  animate={{ scale: isExpanded ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Eye size={16} />
                </motion.div>
                How this explains the pattern
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} className={isMentalModel ? 'text-[#00FFFF]' : 'text-amber-500'} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 px-1">
                    <div className={`relative pl-4 ${
                      isMentalModel ? 'border-l-2 border-[#00FFFF]/30' : 'border-l-2 border-amber-500/30'
                    }`}>
                      {/* Render explanation with markdown support */}
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown components={markdownComponents}>
                          {processMarkdown(tool.explanation || "Analysis pending...")}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Learn More Section */}
          <motion.div 
            className="mt-6 pt-4 border-t border-[#333333]/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <button className={`group/learn flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                isMentalModel 
                  ? 'text-[#00FFFF] hover:bg-[#00FFFF]/10' 
                  : 'text-amber-500 hover:bg-amber-500/10'
              }`}>
                <span>Learn More</span>
                <ExternalLink size={14} className="group-hover/learn:translate-x-0.5 group-hover/learn:-translate-y-0.5 transition-transform" />
              </button>
              
              {/* Visual indicator of tool type */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isMentalModel ? 'bg-[#00FFFF]' : 'bg-amber-500'
                } animate-pulse`}></div>
                <span className="text-xs text-gray-500">
                  {isMentalModel ? 'Pattern Model' : 'Cognitive Trap'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Corner accent */}
        <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none ${
          isMentalModel 
            ? 'bg-gradient-to-bl from-[#00FFFF]' 
            : 'bg-gradient-to-bl from-amber-500'
        }`} style={{
          maskImage: 'radial-gradient(circle at top right, black, transparent)',
          WebkitMaskImage: 'radial-gradient(circle at top right, black, transparent)'
        }}></div>
      </div>
    </motion.div>
  );
};

export default ToolCard;