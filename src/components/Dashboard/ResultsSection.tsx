// src/components/Dashboard/ResultsSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Brain, AlertTriangle, Layers } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Pattern Analysis Results Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              Pattern Analysis
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6">
            Understanding: "{query}"
          </p>
          
          {/* Enhanced Explore New Pattern Button */}
          <motion.div className="inline-block relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-lg blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            
            {/* Button */}
            <motion.button
              onClick={onResetQuery}
              className="relative inline-flex items-center gap-3 px-6 py-3 bg-[#252525] border border-[#00FFFF]/30 rounded-lg font-medium transition-all duration-300 hover:border-[#00FFFF]/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Search className="w-5 h-5 text-[#00FFFF] relative z-10" />
              <span className="text-white relative z-10">Explore New Pattern</span>
              <ArrowRight className="w-4 h-4 text-[#00FFFF] relative z-10" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Pattern Analysis Grid */}
      {results.recommendedTools && results.recommendedTools.length > 0 ? (
        <div>
          {/* Mental Models Explaining the Pattern */}
          {mentalModels.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#00FFFF]" />
                Mental Models That Explain This Pattern
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentalModels.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Cognitive Biases Affecting Perception */}
          {cognitiveBiases.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Biases That Might Cloud Your View
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cognitiveBiases.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No clear patterns identified. Try describing what you're observing in more detail.</p>
        </div>
      )}

      {/* Pattern Connections Summary - Premium Feature */}
      {displayTier === 'premium' && results.relationshipsSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 backdrop-blur-sm rounded-xl p-6 border border-[#8B5CF6]/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#8B5CF6]/20 rounded-lg">
              <Layers className="h-5 w-5 text-[#8B5CF6]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              How These Patterns Connect
            </h3>
            <span className="ml-auto text-xs px-2 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full">
              Premium Pattern Insight
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {results.relationshipsSummary}
          </p>
        </motion.div>
      )}

      {/* Pattern Analysis Upgrade Prompt - Free Users */}
      {displayTier === 'free' && <UpgradePrompt />}
    </motion.div>
  );
};

export default ResultsSection;