// src/components/Dashboard/ResultsSection.tsx - REFERENCE GUIDE IN THREADS
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
  const [showReferences, setShowReferences] = useState(false); // Mobile reference panel
  
  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];

  // Create a map of IDs to tools
  const toolIdMap = useMemo(() => {
    const map: Record<string, { name: string; type: string; elementId: string }> = {};
    results.recommendedTools?.forEach((tool, index) => {
      if (tool.id) {
        const upperCaseId = tool.id.toUpperCase();
        // Create various possible ID formats
        const possibleIds = [
          upperCaseId,
          upperCaseId.replace(/^(MM|SI|ST|CB)/, '$1'),
          // Handle ST017 format
          upperCaseId.match(/^(MM|SI|ST|CB)(\d+)$/)?.[0] || upperCaseId
        ];
        
        possibleIds.forEach(id => {
          map[id] = {
            name: tool.name,
            type: tool.type,
            elementId: `tool-card-${tool.id}` // ID for scrolling
          };
        });
      }
    });
    return map;
  }, [results.recommendedTools]);

  // Function to scroll to a tool card (mobile-optimized)
  const scrollToTool = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Close reference panel on mobile
      if (window.innerWidth < 768) {
        setShowReferences(false);
      }
      
      // Add offset for mobile to account for sticky headers
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      // Add a highlight effect
      element.classList.add('ring-2', 'ring-[#00FFFF]', 'ring-opacity-50', 'scale-[1.02]');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[#00FFFF]', 'ring-opacity-50', 'scale-[1.02]');
      }, 2000);
    }
  };

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

  // Enhanced text processing function with mobile optimization
  const processTextWithIds = (text: string): (string | JSX.Element)[] => {
    if (!text) return [text];
    
    // Match various ID formats: ST017, CB058, MM001, etc.
    const parts = text.split(/\b((MM|SI|ST|CB)\d{3})\b/g);
    
    return parts.map((part, index) => {
      // Check if this part matches our ID pattern
      const idMatch = part.match(/^(MM|SI|ST|CB)\d{3}$/);
      if (idMatch) {
        const toolInfo = toolIdMap[part];
        
        if (toolInfo) {
          return (
            <button
              key={index}
              onClick={() => scrollToTool(toolInfo.elementId)}
              className="inline-flex items-center gap-1 px-2 py-1 mx-0.5 bg-[#00FFFF]/10 active:bg-[#00FFFF]/30 text-[#00FFFF] rounded text-xs font-mono transition-all duration-200 touch-manipulation min-h-[28px] align-baseline"
              type="button"
              aria-label={`Jump to ${toolInfo.name}`}
            >
              <span className="font-bold">{part}</span>
              {/* Always show abbreviated name on mobile for context */}
              <span className="text-[10px] opacity-70 font-sans max-w-[100px] truncate">
                {toolInfo.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </button>
          );
        }
        
        // If ID not found in map, still style it but without click functionality
        return (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 mx-0.5 bg-gray-500/10 text-gray-400 rounded text-xs font-mono"
          >
            {part}
          </span>
        );
      }
      
      return part;
    });
  };

  // Custom ReactMarkdown components
  const createMarkdownComponents = () => ({
    strong: ({ children }: any) => (
      <strong className="font-semibold text-[#00FFFF]">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="text-gray-200 italic">{children}</em>
    ),
    p: ({ children }: any) => {
      const processedChildren = React.Children.map(children, child => {
        if (typeof child === 'string') {
          return processTextWithIds(child);
        }
        return child;
      });
      return <p className="mb-0 leading-relaxed">{processedChildren}</p>;
    },
    code: ({ children }: any) => (
      <code className="px-1 py-0.5 bg-[#333333] text-[#00FFFF] rounded text-xs">{children}</code>
    ),
  });

  // For action items, we need a simpler version
  const processActionItem = (item: string) => {
    const processed = processTextWithIds(item);
    return <span className="inline-flex items-start flex-wrap">{processed}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 md:space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
            Pattern Analysis
          </span>
        </h2>
        <p className="text-gray-400 text-sm px-4">
          Understanding: <span className="text-white font-medium">"{query}"</span>
        </p>
      </div>

      {/* Search Grounding if available */}
      {results.searchGrounding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center px-4"
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
          className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/80 rounded-2xl p-4 md:p-8 border border-[#333333]/50"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-xl md:text-2xl">📖</span>
              Narrative Analysis
            </h3>
            <button
              onClick={() => setShowNarrative(!showNarrative)}
              className="text-gray-400 hover:text-white transition-colors p-2 -mr-2"
              aria-label={showNarrative ? "Hide narrative" : "Show narrative"}
            >
              {showNarrative ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          
          {showNarrative && (
            <div className="space-y-4 md:space-y-6">
              {/* Hook */}
              <div className="text-center py-4">
                <p className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] px-2">
                  {results.narrativeAnalysis.hook}
                </p>
              </div>
              
              {/* Threads Section with Reference Guide */}
              <div className="space-y-3">
                {/* Mobile Reference Toggle - Now inside threads section */}
                <div className="md:hidden mb-3">
                  <button
                    onClick={() => setShowReferences(!showReferences)}
                    className="w-full flex items-center justify-between p-3 bg-[#1A1A1A]/30 rounded-lg border border-[#333333]/30"
                  >
                    <span className="flex items-center gap-2 text-sm text-gray-300">
                      <Info className="w-4 h-4" />
                      Reference Guide
                    </span>
                    {showReferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showReferences && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 p-3 bg-[#1A1A1A]/50 rounded-lg"
                    >
                      <p className="text-xs text-gray-400 mb-3">
                        Tap any code to jump to its explanation
                      </p>
                      <div className="space-y-2">
                        {Object.entries(toolIdMap)
                          .filter(([id]) => id.match(/^(MM|SI|ST|CB)\d{3}$/))
                          .map(([id, tool]) => (
                            <button
                              key={id}
                              onClick={() => {
                                scrollToTool(tool.elementId);
                                setShowReferences(false);
                              }}
                              className="w-full flex items-center gap-2 p-2 bg-[#1A1A1A]/30 rounded text-left"
                            >
                              <span className={`font-mono text-sm ${tool.type === 'mental_model' ? 'text-[#00FFFF]' : 'text-amber-500'}`}>
                                {id}
                              </span>
                              <span className="text-xs text-gray-300 flex-1">
                                {tool.name}
                              </span>
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Desktop Reference Guide - Now inside threads section */}
                {Object.keys(toolIdMap).length > 0 && (
                  <div className="hidden md:block p-3 bg-[#1A1A1A]/30 rounded-lg border border-[#333333]/30 mb-4">
                    <p className="text-xs text-gray-400 mb-2 font-semibold">
                      💡 Click on reference codes to jump to detailed explanations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(toolIdMap)
                        .filter(([id]) => id.match(/^(MM|SI|ST|CB)\d{3}$/))
                        .map(([id, tool]) => (
                          <button
                            key={id}
                            onClick={() => scrollToTool(tool.elementId)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#1A1A1A]/50 hover:bg-[#1A1A1A]/70 rounded text-xs transition-all duration-200 group"
                          >
                            <span className={`font-mono ${tool.type === 'mental_model' ? 'text-[#00FFFF]' : 'text-amber-500'}`}>
                              {id}
                            </span>
                            <span className="text-gray-500">=</span>
                            <span className="text-gray-300 group-hover:text-white">
                              {tool.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Individual Threads */}
                {results.narrativeAnalysis.threads.map((thread, index) => (
                  <motion.div 
                    key={thread.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 md:p-4 bg-[#1A1A1A]/50 rounded-xl hover:bg-[#1A1A1A]/70 transition-all duration-200"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl flex-shrink-0">{thread.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block mb-2 font-medium ${getThreadStyle(thread.type)}`}>
                          {thread.type.charAt(0).toUpperCase() + thread.type.slice(1)}
                        </span>
                        <div className="text-sm text-gray-300 leading-relaxed">
                          <ReactMarkdown components={createMarkdownComponents()}>
                            {thread.content}
                          </ReactMarkdown>
                        </div>
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
              <div className="text-center py-3 md:py-4 px-4 md:px-6 bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 rounded-xl border border-[#00FFFF]/20">
                <p className="text-base md:text-lg font-semibold text-white">
                  {results.narrativeAnalysis.bottomLine}
                </p>
              </div>
              
              {/* Action Plan */}
              {results.narrativeAnalysis.actionPlan && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg md:text-xl">🎯</span>
                    <h4 className="text-base md:text-lg font-semibold">Action Plan</h4>
                    <span className="text-xs px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full font-medium">
                      {results.narrativeAnalysis.actionPlan.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {results.narrativeAnalysis.actionPlan.sections.map((section, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="bg-[#1A1A1A]/50 rounded-xl p-4 md:p-5 border border-[#333333]/30"
                      >
                        <h5 className="font-semibold text-[#8B5CF6] mb-3 flex items-center gap-2 text-sm md:text-base">
                          <span>{idx === 0 ? '🚀' : '💡'}</span>
                          {section.sectionName}
                        </h5>
                        <ul className="space-y-2">
                          {section.actionItems.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                              <span className="text-[#8B5CF6] mt-0.5 flex-shrink-0">→</span>
                              <div className="flex-1">{processActionItem(item)}</div>
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
          className="bg-gradient-to-br from-[#1F1F1F]/80 to-[#252525]/80 rounded-2xl p-4 md:p-8 border border-[#333333]/50"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <span className="text-xl md:text-2xl">💡</span>
              Key Takeaways
            </h3>
            <button
              onClick={() => setShowLessons(!showLessons)}
              className="text-gray-400 hover:text-white transition-colors p-2 -mr-2"
            >
              {showLessons ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          
          {showLessons && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {results.keyLessons.map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 md:p-4 bg-[#1A1A1A]/50 rounded-lg border border-amber-500/20 hover:border-amber-500/30 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-amber-500/10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold text-amber-500">
                    {index + 1}
                  </span>
                  <div className="text-xs md:text-sm text-gray-300 leading-relaxed flex-1">
                    <ReactMarkdown components={createMarkdownComponents()}>
                      {lesson}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tools Section */}
      {results.recommendedTools && results.recommendedTools.length > 0 ? (
        <div className="space-y-6 md:space-y-8">
          {/* Mental Models */}
          {mentalModels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2 px-4 md:px-0">
                <span className="text-[#00FFFF]">🧠</span>
                Mental Models
                <span className="text-sm text-gray-400">({mentalModels.length})</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
                {mentalModels.map((tool, index) => (
                  <div key={tool.id} id={`tool-card-${tool.id}`} className="transition-all duration-300">
                    <ToolCard tool={tool} index={index} />
                  </div>
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
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2 px-4 md:px-0">
                <span className="text-amber-500">⚠️</span>
                Cognitive Biases
                <span className="text-sm text-gray-400">({cognitiveBiases.length})</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
                {cognitiveBiases.map((tool, index) => (
                  <div key={tool.id} id={`tool-card-${tool.id}`} className="transition-all duration-300">
                    <ToolCard tool={tool} index={mentalModels.length + index} />
                  </div>
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
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40"
      >
        <motion.button
          onClick={onResetQuery}
          className="group flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-3 bg-[#1A1A1A] border border-[#00FFFF]/30 rounded-full shadow-xl hover:shadow-2xl hover:shadow-[#00FFFF]/20 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-[#00FFFF] group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-white font-medium text-sm md:text-base">New Analysis</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ResultsSection;