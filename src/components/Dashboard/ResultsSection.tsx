// src/components/Dashboard/ResultsSection.tsx - POLISHED SIMPLE VERSION
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showNarrative, setShowNarrative] = useState(true);
  const [showLessons, setShowLessons] = useState(true);
  
  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];

  // Helper to get thread type color/style
  const getThreadStyle = (type: string) => {
    switch (type) {
      case 'opening':
        return 'bg-gray-500/20 text-gray-400';
      case 'pattern':
        return 'bg-[#00FFFF]/20 text-[#00FFFF]';
      case 'insight':
        return 'bg-amber-500/20 text-amber-500';
      case 'connection':
        return 'bg-[#8B5CF6]/20 text-[#8B5CF6]';
      case 'conclusion':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Helper to highlight tool names in thread content
  const highlightToolNames = (content: string, tools: string[]) => {
    let highlighted = content;
    tools.forEach(tool => {
      // Escape special regex characters in tool name
      const escapedTool = tool.replace(/[.*+?^${}()|[\]\\]/g, '\\const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  query,
  displayTier,
  onResetQuery,
}) => {
  const [showNarrative, setShowNarrative] = useState(true);
  const [showLessons, setShowLessons] = useState(true);
  
  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];

  // Helper to get thread type color/style
  const getThreadStyle = (type: string) => {
    switch (type) {
      case 'opening':
        return 'bg-gray-500/20 text-gray-400';
      case 'pattern':
        return 'bg-[#00FFFF]/20 text-[#00FFFF]';
      case 'insight':
        return 'bg-amber-500/20 text-amber-500';
      case 'connection':
        return 'bg-[#8B5CF6]/20 text-[#8B5CF6]';
      case 'conclusion':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };');
      highlighted = highlighted.replace(
        new RegExp(`\\b${escapedTool}\\b`, 'gi'),
        `<strong class="text-[#00FFFF] font-semibold">${tool}</strong>`
      );
    });
    return highlighted;
  };

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

      {/* Search Grounding if available */}
      {results.searchGrounding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#252525]/50 rounded-full border border-[#333333]/50">
            <span className="text-[#00FFFF]">🔍</span>
            <span className="text-sm text-gray-300">Enhanced with web search</span>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-400">{results.searchGrounding.sourcesCount} sources</span>
          </div>
        </motion.div>
      )}

      {/* Narrative Analysis - Premium Only */}
      {results.narrativeAnalysis && displayTier === 'premium' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/80 rounded-2xl p-6 md:p-8 border border-[#333333]/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">📖</span>
              Narrative Analysis
            </h3>
            <button
              onClick={() => setShowNarrative(!showNarrative)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showNarrative ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          
          {showNarrative && (
            <div className="space-y-6">
              {/* Hook */}
              <div className="text-center py-4">
                <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                  {results.narrativeAnalysis.hook}
                </p>
              </div>
              
              {/* Threads */}
              <div className="space-y-3">
                {results.narrativeAnalysis.threads.map((thread, index) => (
                  <motion.div 
                    key={thread.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-[#1A1A1A]/50 rounded-xl hover:bg-[#1A1A1A]/70 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{thread.emoji}</span>
                      <div className="flex-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block mb-2 font-medium ${getThreadStyle(thread.type)}`}>
                          {thread.type.charAt(0).toUpperCase() + thread.type.slice(1)}
                        </span>
                        <p 
                          className="text-sm text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightToolNames(thread.content, thread.tools) 
                          }}
                        />
                        {thread.tools.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {thread.tools.map((tool, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-[#00FFFF]/10 text-[#00FFFF] rounded-md">
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Bottom Line */}
              <div className="text-center py-4 px-6 bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 rounded-xl border border-[#00FFFF]/20">
                <p className="text-lg font-semibold text-white">
                  {results.narrativeAnalysis.bottomLine}
                </p>
              </div>
              
              {/* Action Plan */}
              {results.narrativeAnalysis.actionPlan && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <h4 className="text-lg font-semibold">Action Plan</h4>
                    <span className="text-xs px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full font-medium">
                      {results.narrativeAnalysis.actionPlan.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.narrativeAnalysis.actionPlan.sections.map((section, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="bg-[#1A1A1A]/50 rounded-xl p-5 border border-[#333333]/30"
                      >
                        <h5 className="font-semibold text-[#8B5CF6] mb-3 flex items-center gap-2">
                          <span>{idx === 0 ? '🚀' : '💡'}</span>
                          {section.sectionName}
                        </h5>
                        <ul className="space-y-2">
                          {section.actionItems.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-[#8B5CF6] mt-0.5">→</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Key Lessons - Premium Only */}
      {results.keyLessons && results.keyLessons.length > 0 && displayTier === 'premium' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1F1F1F]/80 to-[#252525]/80 rounded-2xl p-6 md:p-8 border border-[#333333]/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Key Takeaways
            </h3>
            <button
              onClick={() => setShowLessons(!showLessons)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showLessons ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          
          {showLessons && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.keyLessons.map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-[#1A1A1A]/50 rounded-lg border border-amber-500/20 hover:border-amber-500/30 transition-colors"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center text-sm font-semibold text-amber-500">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">{lesson}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tools Section */}
      {results.recommendedTools && results.recommendedTools.length > 0 ? (
        <div className="space-y-8">
          {/* Mental Models */}
          {mentalModels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-[#00FFFF]">🧠</span>
                Mental Models
                <span className="text-sm text-gray-400">({mentalModels.length})</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mentalModels.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Cognitive Biases */}
          {cognitiveBiases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-amber-500">⚠️</span>
                Cognitive Biases
                <span className="text-sm text-gray-400">({cognitiveBiases.length})</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cognitiveBiases.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={mentalModels.length + index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* No Results */
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No patterns identified</p>
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {displayTier === 'free' && <UpgradePrompt />}

      {/* New Analysis Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-40"
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

export default ResultsSection; 