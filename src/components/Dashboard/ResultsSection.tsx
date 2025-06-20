// src/components/Dashboard/ResultsSection.tsx - SIMPLE VERSION FOR TESTING
import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { LatticeInsightResponse, UserTier } from './types';
import ToolCard from './ToolCard';
import UpgradePrompt from './UpgradePrompt';

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
  // Log what we received
  console.log('=== RESULTS SECTION DEBUG ===');
  console.log('Results exist:', !!results);
  console.log('Tools count:', results?.recommendedTools?.length);
  console.log('Has narrative:', !!results?.narrativeAnalysis);
  console.log('Has key lessons:', !!results?.keyLessons);
  console.log('Display tier:', displayTier);
  
  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
            Pattern Analysis
          </span>
        </h2>
        <p className="text-gray-400 text-sm">
          Understanding: <span className="text-white font-medium">"{query}"</span>
        </p>
      </div>

      {/* Show new format data if available */}
      {results.narrativeAnalysis && displayTier === 'premium' && (
        <div className="bg-[#252525]/50 rounded-xl p-6 border border-[#333333]">
          <h3 className="text-xl font-semibold mb-4 text-[#00FFFF]">Narrative Analysis (New v14.7 Format)</h3>
          
          {/* Hook */}
          <div className="mb-4">
            <p className="text-lg font-medium text-white">{results.narrativeAnalysis.hook}</p>
          </div>
          
          {/* Threads */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-gray-400">Threads:</h4>
            {results.narrativeAnalysis.threads.map((thread) => (
              <div key={thread.id} className="p-3 bg-[#1A1A1A]/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{thread.emoji}</span>
                  <div>
                    <span className="text-xs text-gray-500">{thread.type}</span>
                    <p className="text-sm text-gray-300">{thread.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom Line */}
          <div className="border-t border-[#333333] pt-4">
            <p className="font-medium text-[#8B5CF6]">{results.narrativeAnalysis.bottomLine}</p>
          </div>
        </div>
      )}

      {/* Key Lessons if available */}
      {results.keyLessons && results.keyLessons.length > 0 && displayTier === 'premium' && (
        <div className="bg-[#252525]/50 rounded-xl p-6 border border-[#333333]">
          <h3 className="text-lg font-semibold mb-4">Key Lessons</h3>
          <ul className="space-y-2">
            {results.keyLessons.map((lesson, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-[#00FFFF]">{index + 1}.</span>
                <span className="text-sm text-gray-300">{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tools Section (Original Layout) */}
      {results.recommendedTools && results.recommendedTools.length > 0 ? (
        <div className="space-y-8">
          {/* Mental Models */}
          {mentalModels.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">
                Mental Models ({mentalModels.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mentalModels.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Cognitive Biases */}
          {cognitiveBiases.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6">
                Cognitive Biases ({cognitiveBiases.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cognitiveBiases.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={mentalModels.length + index} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Results */
        <div className="text-center py-16">
          <p className="text-gray-400">No patterns identified</p>
        </div>
      )}

      {/* Upgrade Prompt */}
      {displayTier === 'free' && <UpgradePrompt />}

      {/* New Analysis Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={onResetQuery}
          className="group flex items-center gap-3 px-6 py-3 bg-[#1A1A1A] border border-[#00FFFF]/30 rounded-full shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5 text-[#00FFFF]" />
          <span className="text-white font-medium">New Analysis</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ResultsSection;