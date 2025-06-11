// src/components/Dashboard/ResultsSectionWrapper.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import ResultsSectionTest from './ResultsSectionTest';
import { LatticeInsightNarrativeResponse, UserTier } from './types';

interface ResultsSectionWrapperProps {
  results: LatticeInsightNarrativeResponse | null | undefined;
  query: string;
  displayTier: UserTier;
  onResetQuery: () => void;
  showDebugInfo?: boolean;
}

const ResultsSectionWrapper: React.FC<ResultsSectionWrapperProps> = ({
  results,
  query,
  displayTier,
  onResetQuery,
  showDebugInfo = false,
}) => {
  // Comprehensive safety check
  if (!results || typeof results !== 'object') {
    console.error('ResultsSectionWrapper: Invalid or missing results', { 
      results, 
      type: typeof results,
      isNull: results === null,
      isUndefined: results === undefined 
    });
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto mt-20"
      >
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">No Results Available</h3>
          <p className="text-gray-400 mb-6">
            The analysis results could not be loaded. This might happen if you navigated directly to this page.
          </p>
          <motion.button
            onClick={onResetQuery}
            className="px-6 py-3 bg-[#00FFFF]/20 text-[#00FFFF] rounded-lg hover:bg-[#00FFFF]/30 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Return to Dashboard
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Create a safe results object with default values
  const safeResults: LatticeInsightNarrativeResponse = {
    recommendedTools: results.recommendedTools || [],
    relationshipsSummary: results.relationshipsSummary || null,
    narrativeAnalysis: results.narrativeAnalysis || null,
    keyLessons: results.keyLessons || [],
    searchGrounding: results.searchGrounding || undefined,
    metadata: results.metadata || {},
    error: results.error || null
  };

  return (
    <ResultsSectionTest
      results={safeResults}
      query={query}
      displayTier={displayTier}
      onResetQuery={onResetQuery}
      showDebugInfo={showDebugInfo}
    />
  );
};

export default ResultsSectionWrapper;