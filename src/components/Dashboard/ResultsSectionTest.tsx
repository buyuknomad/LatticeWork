// src/components/Dashboard/ResultsSectionTest.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Brain, AlertTriangle, Layers, Sparkles, 
  Plus, RotateCcw, BookOpen, Target, Globe, CheckCircle, 
  Info, ExternalLink, Clock
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ToolCard from './ToolCard';
import UpgradePrompt from './UpgradePrompt';
import EnhancedNarrativeDisplay from './EnhancedNarrativeDisplay';
import ThreadNarrative from './ThreadNarrative';
import { LatticeInsightNarrativeResponse, UserTier, isThreadedNarrative } from './types';

interface ResultsSectionTestProps {
  results: LatticeInsightNarrativeResponse;
  query: string;
  displayTier: UserTier;
  onResetQuery: () => void;
  showDebugInfo?: boolean;
}

const ResultsSectionTest: React.FC<ResultsSectionTestProps> = ({
  results,
  query,
  displayTier,
  onResetQuery,
  showDebugInfo = false,
}) => {
  // Add null safety check
  if (!results) {
    return null;
  }

  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];
  const [isHoveredConnections, setIsHoveredConnections] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'narrative'>('analysis');

  // Process markdown text
  const processMarkdown = (text: string): string => {
    if (!text) return text;
    let processed = text.replace(/\*\*/g, '%%DOUBLE%%');
    processed = processed.replace(/\*/g, '**');
    processed = processed.replace(/%%DOUBLE%%/g, '**');
    return processed;
  };

  // Format search timestamp
  const formatSearchTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Check if narrative is threaded format
  const hasThreadedNarrative = results.narrativeAnalysis && isThreadedNarrative(results.narrativeAnalysis);
  const hasLegacyNarrative = results.narrativeAnalysis && typeof results.narrativeAnalysis === 'string';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Debug Info Panel */}
      {showDebugInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold text-purple-300 mb-2">🔍 Debug Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Tools:</span>
              <span className="text-gray-300 ml-1">{results.recommendedTools?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Quality:</span>
              <span className="text-gray-300 ml-1">{results.metadata?.analysisQuality || 'unknown'}</span>
            </div>
            <div>
              <span className="text-gray-500">Search Used:</span>
              <span className="text-gray-300 ml-1">{results.metadata?.searchPerformed ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">Narrative Type:</span>
              <span className="text-gray-300 ml-1">{hasThreadedNarrative ? 'Threaded' : hasLegacyNarrative ? 'Legacy' : 'None'}</span>
            </div>
            {results.metadata?.searchConfidence !== undefined && (
              <div>
                <span className="text-gray-500">Confidence:</span>
                <span className="text-gray-300 ml-1">{results.metadata.searchConfidence.toFixed(2)}</span>
              </div>
            )}
            {results.metadata?.searchSkipped && (
              <div className="col-span-full">
                <span className="text-gray-500">Skip Reason:</span>
                <span className="text-gray-300 ml-1">{results.metadata.searchSkipped}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Search Status Indicator */}
      {results.searchGrounding?.wasSearchUsed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-300">Enhanced with Current Information</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Searched: "{results.searchGrounding.searchQuery}" • 
                  {results.searchGrounding.sourcesCount} sources • 
                  {formatSearchTime(results.searchGrounding.searchTimestamp)}
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
              Premium Feature
            </span>
          </div>
        </motion.div>
      )}

      {/* Pattern Analysis Results Header */}
      <div className="text-center relative">
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

      {/* Tab Navigation for Premium Users */}
      {displayTier === 'premium' && results.narrativeAnalysis && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-[#252525]/50 rounded-lg p-1 border border-[#333333]">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'analysis'
                  ? 'bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/30'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain size={16} />
                <span>Pattern Breakdown</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('narrative')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'narrative'
                  ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>Full Narrative</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Traditional Tool Cards Display */}
            {results.recommendedTools && results.recommendedTools.length > 0 ? (
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
                      <span className="ml-auto text-sm text-gray-400">
                        {mentalModels.length} models identified
                        {mentalModels.some(m => m.isSurprise) && (
                          <span className="ml-2 text-[#8B5CF6]">✨ Including surprise insights</span>
                        )}
                      </span>
                    </div>
                    
                    {/* Layout based on count - same as original */}
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
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="max-w-3xl mx-auto"
                        >
                          <ToolCard tool={mentalModels[0]} index={0} />
                        </motion.div>
                        
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
                    <div className="absolute -top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-semibold">Biases That Might Cloud Your View</h3>
                      <span className="ml-auto text-sm text-gray-400">{cognitiveBiases.length} biases detected</span>
                    </div>
                    
                    {/* Layout for biases - same as original */}
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

            {/* Pattern Connections Summary */}
            {results.relationshipsSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group relative"
                onMouseEnter={() => setIsHoveredConnections(true)}
                onMouseLeave={() => setIsHoveredConnections(false)}
              >
                {/* Same connections card as original */}
                <motion.div
                  className="absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 bg-gradient-to-r from-[#8B5CF6] to-[#8B5CF6]/50"
                  animate={{ opacity: isHoveredConnections ? 0.15 : 0 }}
                />
                
                <div className="relative h-full bg-[#1F1F1F]/80 backdrop-blur-xl rounded-2xl border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-700 bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#8B5CF6]/5">
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
                            duration: 20 + i * 10,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'linear'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="relative p-2.5 bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/10 rounded-xl"
                        animate={{ 
                          rotate: isHoveredConnections ? [0, -2, 2, 0] : 0,
                        }}
                        transition={{ duration: 0.8 }}
                      >
                        <Layers className="h-5 w-5 text-[#8B5CF6]" />
                        
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-[#8B5CF6]/10"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0, 0.3],
                          }}
                          transition={{
                            duration: 3,
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
                        Pattern Connections
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

                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none bg-gradient-to-bl from-[#8B5CF6]" 
                    style={{
                      maskImage: 'radial-gradient(circle at top right, black, transparent)',
                      WebkitMaskImage: 'radial-gradient(circle at top right, black, transparent)'
                    }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Narrative Tab Content */}
        {activeTab === 'narrative' && displayTier === 'premium' && results.narrativeAnalysis && (
          <motion.div
            key="narrative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Check if narrative is threaded or legacy format */}
            {hasThreadedNarrative ? (
              // NEW: Threaded Narrative Display
              <ThreadNarrative
                narrative={results.narrativeAnalysis as any}
                tools={results.recommendedTools || []}
                onToolClick={(toolName) => {
                  // Optional: Scroll to tool card in analysis tab
                  setActiveTab('analysis');
                  // You could add logic here to highlight the specific tool
                  console.log('Tool clicked from narrative:', toolName);
                }}
              />
            ) : hasLegacyNarrative ? (
              // FALLBACK: Legacy Narrative Display
              <EnhancedNarrativeDisplay
                narrativeAnalysis={results.narrativeAnalysis as string}
                relationshipsSummary={results.relationshipsSummary}
                searchGrounding={results.searchGrounding}
              />
            ) : (
              // No narrative available
              <div className="text-center py-16">
                <p className="text-gray-400">No narrative analysis available</p>
              </div>
            )}

            {/* Key Lessons Card - Show for both formats */}
            {results.keyLessons && results.keyLessons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 bg-gradient-to-r from-amber-500 to-amber-500/50 group-hover:opacity-15" />
                
                <div className="relative bg-[#1F1F1F]/80 backdrop-blur-xl rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5" />

                  <div className="relative p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
                        <Target className="h-6 w-6 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Key Actionable Lessons</h3>
                    </div>

                    <div className="space-y-4">
                      {results.keyLessons.map((lesson, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-4 bg-[#252525]/50 rounded-lg border border-[#333333] hover:border-amber-500/30 transition-all"
                        >
                          <div className="p-1.5 bg-amber-500/20 rounded-full mt-0.5">
                            <CheckCircle className="h-4 w-4 text-amber-500" />
                          </div>
                          <p className="text-gray-300 flex-1">{lesson}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Prompt for Basic Analysis Only */}
      {displayTier === 'free' && !results.narrativeAnalysis && <UpgradePrompt />}

      {/* Fixed Floating Action Button for New Analysis */}
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

export default ResultsSectionTest;