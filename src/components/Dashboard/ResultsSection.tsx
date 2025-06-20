// src/components/Dashboard/ResultsSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { LatticeInsightResponse, UserTier, isV14Response, isLegacyResponse } from './types';
import TabContainer from './TabContainer';
import UpgradePrompt from './UpgradePrompt';
import { useResponsive } from '../../hooks/useResponsive';

// Legacy components for backward compatibility
import ToolCard from './ToolCard';

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
  const { isMobile } = useResponsive();
  
  // Check response format
  const isNewFormat = isV14Response(results);
  const isOldFormat = isLegacyResponse(results);
  
  // Log format detection for debugging
  console.log('RESULTS_FORMAT:', {
    isNewFormat,
    isOldFormat,
    hasNarrative: !!results.narrativeAnalysis,
    hasRelationships: !!results.relationshipsSummary,
    toolCount: results.recommendedTools?.length
  });

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
          <p className="text-gray-400 text-sm sm:text-base mb-4 max-w-2xl mx-auto px-4">
            Understanding: <span className="text-white font-medium">"{query}"</span>
          </p>
        </motion.div>
      </div>

      {/* Main Results Area */}
      {results.recommendedTools && results.recommendedTools.length > 0 ? (
        <>
          {/* New Format: Use Tab Container */}
          {isNewFormat && (
            <TabContainer
              results={results}
              query={query}
              displayTier={displayTier}
            />
          )}
          
          {/* Legacy Format: Show tools directly */}
          {!isNewFormat && (
            <LegacyResultsView 
              results={results} 
              displayTier={displayTier}
            />
          )}
        </>
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

      {/* Fixed Floating Action Button for New Analysis */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className={`
          fixed z-40
          ${isMobile 
            ? 'bottom-20 right-4' // Above tab navigation on mobile
            : 'bottom-6 right-6'
          }
        `}
      >
        <motion.button
          onClick={onResetQuery}
          className="group flex items-center gap-3 px-4 md:px-6 py-3 bg-[#1A1A1A] border border-[#00FFFF]/30 rounded-full shadow-xl hover:shadow-2xl hover:shadow-[#00FFFF]/20 transition-all duration-300"
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

// Legacy Results View Component for backward compatibility
const LegacyResultsView: React.FC<{
  results: LatticeInsightResponse;
  displayTier: UserTier;
}> = ({ results, displayTier }) => {
  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];
  const isFreeUser = displayTier === 'free';

  return (
    <div className="space-y-8">
      {/* Mental Models Section */}
      {mentalModels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Mental Models That Explain This Pattern</h3>
            <span className="ml-auto text-sm text-gray-400">{mentalModels.length} models identified</span>
          </div>
          
          <div className={`
            ${mentalModels.length === 1 
              ? 'max-w-3xl mx-auto' 
              : mentalModels.length === 2
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
              : 'space-y-6'
            }
          `}>
            {mentalModels.length >= 3 ? (
              <>
                <div className="max-w-3xl mx-auto">
                  <ToolCard tool={mentalModels[0]} index={0} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mentalModels.slice(1).map((tool, index) => (
                    <ToolCard key={tool.id} tool={tool} index={index + 1} />
                  ))}
                </div>
              </>
            ) : (
              mentalModels.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))
            )}
          </div>
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
          <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">Biases That Might Cloud Your View</h3>
            <span className="ml-auto text-sm text-gray-400">{cognitiveBiases.length} biases detected</span>
          </div>
          
          <div className={`
            ${cognitiveBiases.length === 1 
              ? 'max-w-3xl mx-auto' 
              : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
            }
          `}>
            {cognitiveBiases.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={mentalModels.length + index} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Legacy Relationship Summary (if present) */}
      {results.relationshipsSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 p-6 bg-[#252525]/50 rounded-xl border border-[#8B5CF6]/20"
        >
          <h3 className="text-lg font-semibold mb-3 text-[#8B5CF6]">How These Patterns Connect</h3>
          <p className="text-gray-300 leading-relaxed">{results.relationshipsSummary}</p>
          <p className="text-xs text-gray-500 mt-4">
            Note: This analysis uses an older format. New analyses provide more detailed insights.
          </p>
        </motion.div>
      )}

      {/* Upgrade Prompt for Basic Analysis */}
      {isFreeUser && <UpgradePrompt />}
    </div>
  );
};

export default ResultsSection;