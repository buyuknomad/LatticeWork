// src/components/Dashboard/ResultsSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Brain, AlertTriangle, Layers, Sparkles, ChevronRight } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Pattern Analysis Results Header - Enhanced */}
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
          <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-2xl mx-auto">
            Understanding: <span className="text-white font-medium">"{query}"</span>
          </p>
          
          {/* Enhanced Explore New Pattern Button */}
          <motion.div className="inline-block relative group">
            {/* Multi-layer glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            
            {/* Button with enhanced styling */}
            <motion.button
              onClick={onResetQuery}
              className="relative inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-[#00FFFF]/20 rounded-xl font-medium transition-all duration-300 group-hover:border-[#00FFFF]/50 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF]/0 via-[#00FFFF]/10 to-[#8B5CF6]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <Search className="w-5 h-5 text-[#00FFFF] relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-white relative z-10 font-semibold">Explore New Pattern</span>
              <ArrowRight className="w-4 h-4 text-[#00FFFF] relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
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
            /* Premium Tier Layout - Bento Box Style */
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
                  
                  {/* Bento Grid for Mental Models */}
                  <div className={`grid gap-6 ${
                    mentalModels.length === 1 ? 'grid-cols-1' :
                    mentalModels.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                    'grid-cols-1 lg:grid-cols-3'
                  }`}>
                    {mentalModels.slice(0, 3).map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={index === 0 && mentalModels.length > 2 ? 'lg:col-span-2' : ''}
                      >
                        <ToolCard tool={tool} index={index} />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Additional models if any */}
                  {mentalModels.length > 3 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mentalModels.slice(3).map((tool, index) => (
                        <ToolCard key={tool.id} tool={tool} index={index + 3} />
                      ))}
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
                  
                  <div className={`grid gap-6 ${
                    cognitiveBiases.length === 1 ? 'grid-cols-1 max-w-2xl' :
                    'grid-cols-1 lg:grid-cols-2'
                  }`}>
                    {cognitiveBiases.map((tool, index) => (
                      <ToolCard key={tool.id} tool={tool} index={index + mentalModels.length} />
                    ))}
                  </div>
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

      {/* Pattern Connections Summary - Premium Feature Enhanced */}
      {displayTier === 'premium' && results.relationshipsSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative overflow-hidden"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/5 via-[#8B5CF6]/10 to-[#8B5CF6]/5 animate-gradient-x"></div>
          
          <div className="relative bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#8B5CF6]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#8B5CF6]/20 rounded-xl">
                <Layers className="h-6 w-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                How These Patterns Connect
              </h3>
              <span className="ml-auto text-xs px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full font-medium">
                Premium Insight
              </span>
            </div>
            
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5CF6]/0 via-[#8B5CF6]/50 to-[#8B5CF6]/0"></div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line pl-4">
                {results.relationshipsSummary}
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8B5CF6]/10 rounded-full filter blur-2xl"></div>
          </div>
        </motion.div>
      )}

      {/* Upgrade Prompt - Redesigned for Free Users */}
      {displayTier === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="relative">
            {/* Preview of locked content */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1A1A1A] pointer-events-none z-10"></div>
            <div className="filter blur-sm opacity-50 pointer-events-none">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-32 bg-[#252525] rounded-xl animate-pulse"></div>
                <div className="h-32 bg-[#252525] rounded-xl animate-pulse"></div>
              </div>
            </div>
            
            {/* Upgrade CTA Overlay */}
            <div className="absolute inset-x-0 bottom-0 z-20">
              <UpgradePrompt />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResultsSection;

// Add this CSS to your global styles (e.g., in index.css):
/*
@keyframes gradient-x {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

.animate-gradient-x {
  animation: gradient-x 15s ease infinite;
}
*/