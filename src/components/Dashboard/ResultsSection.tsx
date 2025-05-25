// src/components/Dashboard/ResultsSection.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Brain, AlertTriangle, Layers, Sparkles, Plus, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ToolCard from './ToolCard';
import UpgradePrompt from './UpgradePrompt';
import { LatticeInsightResponse, UserTier } from './types';

interface ResultsSectionProps {
  results: LatticeInsightResponse;
  query: string;
  displayTier: UserTier;
  onResetQuery: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  query,
  displayTier,
  onResetQuery,
}) => {
  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];
  const isFreeUser = displayTier === 'free';
  const [isHoveredConnections, setIsHoveredConnections] = useState(false);

  // Process markdown text to handle various syntax (same as in ToolCard)
  const processMarkdown = (text: string): string => {
    if (!text) return text;
    
    // First, protect already doubled asterisks by temporarily replacing them
    let processed = text.replace(/\*\*/g, '%%DOUBLE%%');
    
    // Convert single asterisks to double
    processed = processed.replace(/\*/g, '**');
    
    // Restore the original double asterisks
    processed = processed.replace(/%%DOUBLE%%/g, '**');
    
    return processed;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Pattern Analysis Results Header */}
      <div className="text-center relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-gradient-to-r from-[#00FFFF]/5 to-[#8B5CF6]/5 rounded-full filter blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] via-[#00FFFF]/80 to-[#8B5CF6]">
              Pattern Analysis
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 max-w-2xl mx-auto">
            Understanding: <span className="text-white font-medium">"{query}"</span>
          </p>
        </motion.div>
      </div>

      {/* Main Results Area */}
      {results.recommendedTools && results.recommendedTools.length > 0 ? (
        <div>
          {isFreeUser ? (
            /* Free Tier Layout - Elegant Side-by-Side */
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/5 via-transparent to-[#8B5CF6]/5 rounded-3xl pointer-events-none"></div>
              
              <div className="relative z-10 bg-[#1F1F1F]/50 backdrop-blur-sm rounded-3xl p-8 border border-[#333333]/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Mental Model - Left Side */}
                  {mentalModels.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="relative"
                    >
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#00FFFF]/10 rounded-full filter blur-2xl"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-gradient-to-br from-[#00FFFF]/20 to-[#00FFFF]/10 rounded-xl">
                            <Brain className="h-6 w-6 text-[#00FFFF]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Mental Model</h3>
                            <p className="text-xs text-gray-400">Understanding the pattern</p>
                          </div>
                        </div>
                        <ToolCard tool={mentalModels[0]} index={0} />
                      </div>
                    </motion.div>
                  )}

                  {/* Cognitive Bias - Right Side */}
                  {cognitiveBiases.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full filter blur-2xl"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Cognitive Bias</h3>
                            <p className="text-xs text-gray-400">What might cloud your view</p>
                          </div>
                        </div>
                        <ToolCard tool={cognitiveBiases[0]} index={1} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Connection Line - Visual Link Between Model and Bias */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
                <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            /* Premium Tier Layout - Clean Hierarchy */
            <div className="space-y-8">
              {/* Mental Models Section */}
              {mentalModels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-[#00FFFF]/20 to-[#00FFFF]/10 rounded-xl">
                      <Brain className="h-6 w-6 text-[#00FFFF]" />
                    </div>
                    <h3 className="text-xl font-semibold">Mental Models That Explain This Pattern</h3>
                    <span className="ml-auto text-sm text-gray-400">{mentalModels.length} models identified</span>
                  </div>
                  
                  {/* Layout based on count */}
                  {mentalModels.length === 1 && (
                    <div className="max-w-3xl mx-auto">
                      <ToolCard tool={mentalModels[0]} index={0} />
                    </div>
                  )}
                  
                  {mentalModels.length === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {mentalModels.map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <ToolCard tool={tool} index={index} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {mentalModels.length >= 3 && (
                    <div className="space-y-6">
                      {/* First model - full width */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-3xl mx-auto"
                      >
                        <ToolCard tool={mentalModels[0]} index={0} />
                      </motion.div>
                      
                      {/* Remaining models - side by side */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mentalModels.slice(1, 3).map((tool, index) => (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
                          >
                            <ToolCard tool={tool} index={index + 1} />
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* If more than 3, show the rest in pairs */}
                      {mentalModels.length > 3 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {mentalModels.slice(3).map((tool, index) => (
                            <motion.div
                              key={tool.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: (index + 3) * 0.1 }}
                            >
                              <ToolCard tool={tool} index={index + 3} />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Cognitive Biases Section */}
              {cognitiveBiases.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  {/* Decorative separator */}
                  <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Biases That Might Cloud Your View</h3>
                    <span className="ml-auto text-sm text-gray-400">{cognitiveBiases.length} biases detected</span>
                  </div>
                  
                  {/* Layout based on count - only 1 or 2 side by side */}
                  {cognitiveBiases.length === 1 && (
                    <div className="max-w-3xl mx-auto">
                      <ToolCard tool={cognitiveBiases[0]} index={mentalModels.length} />
                    </div>
                  )}
                  
                  {cognitiveBiases.length >= 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {cognitiveBiases.slice(0, 2).map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: (mentalModels.length + index) * 0.1 }}
                        >
                          <ToolCard tool={tool} index={mentalModels.length + index} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {/* If more than 2 biases, show the rest in pairs */}
                  {cognitiveBiases.length > 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      {cognitiveBiases.slice(2).map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: (mentalModels.length + index + 2) * 0.1 }}
                        >
                          <ToolCard tool={tool} index={mentalModels.length + index + 2} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* No Results State */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg mb-2">No clear patterns identified</p>
          <p className="text-gray-500 text-sm">Try describing what you're observing in more detail</p>
        </motion.div>
      )}

      {/* Pattern Connections Summary - Premium Feature with Same Hover as Tool Cards */}
      {displayTier === 'premium' && results.relationshipsSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="group relative"
          onMouseEnter={() => setIsHoveredConnections(true)}
          onMouseLeave={() => setIsHoveredConnections(false)}
        >
          {/* Animated glow effect on hover - REDUCED OPACITY */}
          <motion.div
            className="absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 bg-gradient-to-r from-[#8B5CF6] to-[#8B5CF6]/50"
            animate={{ opacity: isHoveredConnections ? 0.15 : 0 }}
          />
          
          <div className="relative h-full bg-[#1F1F1F]/80 backdrop-blur-xl rounded-2xl border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 transition-all duration-300 overflow-hidden">
            {/* Animated background gradient - MORE SUBTLE */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-700 bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#8B5CF6]/5">
              {/* Moving particles effect - SLOWER */}
              <div className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[#8B5CF6]/20"
                    initial={{ 
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%'
                    }}
                    animate={{
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                    }}
                    transition={{
                      duration: 20 + i * 10, // Slower movement
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'linear'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Card Content */}
            <div className="relative p-8">
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  className="relative p-2.5 bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/10 rounded-xl"
                  animate={{ 
                    rotate: isHoveredConnections ? [0, -2, 2, 0] : 0, // Reduced rotation
                  }}
                  transition={{ duration: 0.8 }} // Slower
                >
                  <Layers className="h-5 w-5 text-[#8B5CF6]" />
                  
                  {/* Pulse effect on icon - MORE SUBTLE */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-[#8B5CF6]/10"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 3, // Slower pulse
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                
                <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  How These Patterns Connect
                </h3>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <motion.span 
                  className="text-xs px-3 py-1 rounded-full font-medium bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20"
                  whileHover={{ scale: 1.05 }}
                >
                  Premium Insight
                </motion.span>
              </div>
              
              <div className="relative">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }: any) => (
                        <p className="text-gray-300 leading-relaxed mb-4 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }: any) => (
                        <strong className="font-semibold text-[#8B5CF6]">{children}</strong>
                      ),
                      em: ({ children }: any) => (
                        <em className="text-gray-200 italic">{children}</em>
                      ),
                      code: ({ children }: any) => (
                        <code className="px-1.5 py-0.5 bg-[#333333] text-[#8B5CF6] rounded text-xs font-mono">{children}</code>
                      ),
                      ul: ({ children }: any) => (
                        <ul className="list-disc list-inside space-y-1 text-gray-300">{children}</ul>
                      ),
                      ol: ({ children }: any) => (
                        <ol className="list-decimal list-inside space-y-1 text-gray-300">{children}</ol>
                      ),
                      li: ({ children }: any) => (
                        <li className="text-gray-300">{children}</li>
                      ),
                    }}
                  >
                    {processMarkdown(results.relationshipsSummary || '')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none bg-gradient-to-bl from-[#8B5CF6]" 
              style={{
                maskImage: 'radial-gradient(circle at top right, black, transparent)',
                WebkitMaskImage: 'radial-gradient(circle at top right, black, transparent)'
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {displayTier === 'free' && <UpgradePrompt />}

      {/* Fixed Floating Action Button for New Analysis - UPDATED BEHAVIOR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          onClick={onResetQuery}
          className="group flex items-center gap-3 px-6 py-3 bg-[#1A1A1A] border border-[#00FFFF]/30 rounded-full shadow-xl hover:shadow-2xl hover:shadow-[#00FFFF]/20 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5 text-[#00FFFF] group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-white font-medium hidden sm:inline">New Analysis</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ResultsSection;