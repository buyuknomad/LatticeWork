// src/components/Dashboard/ResultsSection.tsx - Enhanced Version with Redesigned Tool Reference Legend
import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles, ChevronDown, ChevronUp, ExternalLink, Crown, Zap, ChevronRight, Brain, AlertTriangle } from 'lucide-react';
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
  
  const mentalModels = results.recommendedTools?.filter(t => t.type === 'mental_model') || [];
  const cognitiveBiases = results.recommendedTools?.filter(t => t.type === 'cognitive_bias') || [];

  // Create refs for each tool card for scrolling
  const toolRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Determine if we should show premium features based on analysis quality
  const analysisQuality = results.metadata?.analysisQuality || (displayTier === 'premium' ? 'premium' : 'basic');
  const showPremiumFeatures = analysisQuality === 'premium';
  const isFreeUserWithPremium = displayTier === 'free' && showPremiumFeatures;

  // Create a map of IDs to tool info
  const toolIdMap = useMemo(() => {
    const map: Record<string, { name: string; type: string; id: string }> = {};
    results.recommendedTools?.forEach(tool => {
      if (tool.id) {
        const idParts = tool.id.match(/^([A-Z]+)(\d+)$/);
        if (idParts) {
          const prefix = idParts[1];
          const number = idParts[2];
          const fullId = `${prefix}${number}`;
          map[fullId.toUpperCase()] = {
            name: tool.name,
            type: tool.type,
            id: tool.id
          };
        }
      }
    });
    return map;
  }, [results.recommendedTools]);

  // Helper to get thread type color/style - UPDATED for new labels
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

  // Helper to get thread type display name - NEW for updated labels
  const getThreadDisplayName = (type: string) => {
    switch (type) {
      case 'pattern':
        return 'Mental Model';
      case 'insight':
        return 'Cognitive Bias';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Function to scroll to a tool card
  const scrollToTool = (toolId: string) => {
    const element = toolRefs.current[toolId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      element.classList.add('ring-2', 'ring-[#00FFFF]', 'ring-opacity-60');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[#00FFFF]', 'ring-opacity-60');
      }, 2000);
    }
  };

  // Extract tool IDs from text
  const extractToolIds = (text: string): string[] => {
    const matches = text.match(/\b(MM|SI|ST|CB)\d{3}\b/g) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  // Function to enhance text with interactive tool references
  const enhanceTextWithInteractiveIds = (text: string) => {
    if (!text) return text;
    
    // Split text by tool ID pattern
    const parts = text.split(/\b((MM|SI|ST|CB)\d{3})\b/g);
    
    return parts.map((part, index) => {
      // Check if this part is a tool ID
      if (/^(MM|SI|ST|CB)\d{3}$/.test(part)) {
        const toolInfo = toolIdMap[part.toUpperCase()];
        
        if (toolInfo) {
          return (
            <button
              key={index}
              onClick={() => scrollToTool(toolInfo.id)}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 text-[#00FFFF] rounded text-xs font-mono transition-all duration-200 cursor-pointer"
              title={`Click to view ${toolInfo.name}`}
            >
              {part}
              <span className="text-[10px] opacity-70">({toolInfo.name})</span>
            </button>
          );
        }
      }
      
      return part;
    });
  };

  // Create markdown components with enhanced text processing
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
          return enhanceTextWithInteractiveIds(child);
        }
        return child;
      });
      return <p className="mb-0">{processedChildren}</p>;
    },
    code: ({ children }: any) => (
      <code className="px-1 py-0.5 bg-[#333333] text-[#00FFFF] rounded text-xs">{children}</code>
    ),
  });

  // Component for tool links under each thread - UPDATED for better visibility
  const ThreadToolLinks: React.FC<{ content: string; tools: string[] }> = ({ content, tools }) => {
    const referencedIds = extractToolIds(content);
    const referencedTools = referencedIds
      .map(id => ({ id, info: toolIdMap[id.toUpperCase()] }))
      .filter(item => item.info);

    if (referencedTools.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-[#333333]/30">
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Referenced:</span>
          {referencedTools.map(({ id, info }) => (
            <button
              key={id}
              onClick={() => scrollToTool(info.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A]/50 hover:bg-[#1A1A1A]/80 border border-[#333333]/50 hover:border-[#00FFFF]/30 rounded-lg transition-all group"
            >
              <span className={`text-sm ${info.type === 'cognitive_bias' ? 'text-amber-500' : 'text-[#00FFFF]'}`}>
                {info.type === 'cognitive_bias' ? '⚠️' : '🧠'}
              </span>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                {info.name}
              </span>
              <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-[#00FFFF] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
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

      {/* Premium Quality Badge for Free Users */}
      {isFreeUserWithPremium && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/25 to-[#00FFFF]/25 rounded-full blur-2xl"></div>
            
            {/* Gradient border */}
            <div className="p-[1.5px] bg-gradient-to-r from-[#8B5CF6] to-[#00FFFF] rounded-full">
              {/* Badge content */}
              <div className="flex items-center gap-4 px-8 py-4 bg-[#1A1A1A] rounded-full">
                {/* Left icon */}
                <Crown className="w-6 h-6 text-[#8B5CF6]" />
                
                {/* Main text */}
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-white tracking-wide">
                    Premium Quality Analysis
                  </span>
                  <span className="text-sm text-gray-300 mt-1">
                    Your 1st trending analysis today • Full premium features
                  </span>
                </div>
                
                {/* Right icon */}
                <Sparkles className="w-5 h-5 text-[#00FFFF]" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Narrative Analysis - Show based on quality, not tier */}
      {results.narrativeAnalysis && showPremiumFeatures && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/80 rounded-2xl p-6 md:p-8 border border-[#333333]/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">📖</span>
              Narrative Analysis
              {isFreeUserWithPremium && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full border border-[#8B5CF6]/30"
                >
                  <Crown className="w-3 h-3" />
                  <span className="text-xs font-medium">Premium</span>
                </motion.span>
              )}
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

              {/* REDESIGNED Tool Reference Legend */}
              {Object.keys(toolIdMap).length > 0 && (
                <div className="mb-8">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#8B5CF6]/20 to-[#00FFFF]/20 rounded-lg">
                        <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Tools Used in Analysis</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Click any tool to jump to detailed explanation</p>
                      </div>
                    </div>
                    
                    {/* Summary Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A]/50 rounded-full border border-[#333333]/50">
                      <span className="text-xs text-gray-400">Total:</span>
                      <span className="text-sm font-semibold text-white">
                        {Object.keys(toolIdMap).length} tools
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Mental Models Section */}
                    {(() => {
                      const mentalModelIds = Object.entries(toolIdMap)
                        .filter(([_, info]) => info.type === 'mental_model');
                      
                      if (mentalModelIds.length === 0) return null;
                      
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="relative"
                        >
                          {/* Section Background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF]/5 via-transparent to-[#00FFFF]/5 rounded-2xl"></div>
                          
                          {/* Section Content */}
                          <div className="relative p-6 border border-[#00FFFF]/20 rounded-2xl">
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#00FFFF]/10 rounded-lg">
                                  <Brain className="w-5 h-5 text-[#00FFFF]" />
                                </div>
                                <div>
                                  <h5 className="text-base font-bold text-[#00FFFF]">Mental Models</h5>
                                  <p className="text-xs text-gray-400">Thinking frameworks that explain the pattern</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 px-2.5 py-1 bg-[#00FFFF]/10 rounded-full">
                                <span className="text-xs font-medium text-[#00FFFF]">{mentalModelIds.length}</span>
                                <span className="text-xs text-[#00FFFF]/80">models</span>
                              </div>
                            </div>
                            
                            {/* Tools Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {mentalModelIds.map(([id, info], index) => {
                                // Find which threads reference this tool
                                const referencingThreads = results.narrativeAnalysis?.threads
                                  .filter(thread => 
                                    thread.tools.includes(info.name) || 
                                    thread.content.includes(id)
                                  )
                                  .map(thread => thread.type) || [];
                                
                                return (
                                  <motion.button
                                    key={id}
                                    onClick={() => scrollToTool(info.id)}
                                    className="group relative p-4 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/60 border border-[#333333]/50 hover:border-[#00FFFF]/40 rounded-xl text-left transition-all duration-300"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                  >
                                    {/* Tool Header */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div className="flex items-start gap-3 flex-1">
                                        <div className="flex-shrink-0 w-10 h-8 bg-[#00FFFF]/10 rounded-lg flex items-center justify-center">
                                          <span className="text-[10px] font-mono font-bold text-[#00FFFF]">{id}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h6 className="font-semibold text-sm text-gray-200 group-hover:text-white line-clamp-2 transition-colors">
                                            {info.name}
                                          </h6>
                                        </div>
                                      </div>
                                      
                                      {/* Jump Icon */}
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4 text-[#00FFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    {/* Referenced In Threads */}
                                    {referencingThreads.length > 0 && (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-wide">Used in:</span>
                                        {referencingThreads.slice(0, 3).map((type, i) => (
                                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-[#00FFFF]/15 text-[#00FFFF] rounded-full font-medium">
                                            {getThreadDisplayName(type)}
                                          </span>
                                        ))}
                                        {referencingThreads.length > 3 && (
                                          <span className="text-[9px] text-gray-500">+{referencingThreads.length - 3}</span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                    
                    {/* Cognitive Biases Section */}
                    {(() => {
                      const biasIds = Object.entries(toolIdMap)
                        .filter(([_, info]) => info.type === 'cognitive_bias');
                      
                      if (biasIds.length === 0) return null;
                      
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="relative"
                        >
                          {/* Section Background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 rounded-2xl"></div>
                          
                          {/* Section Content */}
                          <div className="relative p-6 border border-amber-500/20 rounded-2xl">
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                  <h5 className="text-base font-bold text-amber-500">Cognitive Biases</h5>
                                  <p className="text-xs text-gray-400">Mental shortcuts that may distort judgment</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 rounded-full">
                                <span className="text-xs font-medium text-amber-500">{biasIds.length}</span>
                                <span className="text-xs text-amber-500/80">biases</span>
                              </div>
                            </div>
                            
                            {/* Tools Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {biasIds.map(([id, info], index) => {
                                // Find which threads reference this tool
                                const referencingThreads = results.narrativeAnalysis?.threads
                                  .filter(thread => 
                                    thread.tools.includes(info.name) || 
                                    thread.content.includes(id)
                                  )
                                  .map(thread => thread.type) || [];
                                
                                return (
                                  <motion.button
                                    key={id}
                                    onClick={() => scrollToTool(info.id)}
                                    className="group relative p-4 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/60 border border-[#333333]/50 hover:border-amber-500/40 rounded-xl text-left transition-all duration-300"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                  >
                                    {/* Tool Header */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div className="flex items-start gap-3 flex-1">
                                        <div className="flex-shrink-0 w-10 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                          <span className="text-[10px] font-mono font-bold text-amber-500">{id}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h6 className="font-semibold text-sm text-gray-200 group-hover:text-white line-clamp-2 transition-colors">
                                            {info.name}
                                          </h6>
                                        </div>
                                      </div>
                                      
                                      {/* Jump Icon */}
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                      </div>
                                    </div>
                                    
                                    {/* Referenced In Threads */}
                                    {referencingThreads.length > 0 && (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-wide">Used in:</span>
                                        {referencingThreads.slice(0, 3).map((type, i) => (
                                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-amber-500/15 text-amber-500 rounded-full font-medium">
                                            {getThreadDisplayName(type)}
                                          </span>
                                        ))}
                                        {referencingThreads.length > 3 && (
                                          <span className="text-[9px] text-gray-500">+{referencingThreads.length - 3}</span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </div>
                </div>
              )}
              
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
                          {getThreadDisplayName(thread.type)}
                        </span>
                        <div className="text-sm text-gray-300 leading-relaxed">
                          <ReactMarkdown components={createMarkdownComponents()}>
                            {thread.content}
                          </ReactMarkdown>
                        </div>
                        <ThreadToolLinks content={thread.content} tools={thread.tools} />
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
                              <span className="text-[#8B5CF6] mt-0.5 flex-shrink-0">→</span>
                              <div className="flex-1">
                                <ReactMarkdown components={createMarkdownComponents()}>
                                  {item}
                                </ReactMarkdown>
                              </div>
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

      {/* Key Lessons - Show based on quality, not tier */}
      {results.keyLessons && results.keyLessons.length > 0 && showPremiumFeatures && (
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
              {isFreeUserWithPremium && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full border border-[#8B5CF6]/30"
                >
                  <Crown className="w-3 h-3" />
                  <span className="text-xs font-medium">Premium</span>
                </motion.span>
              )}
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
                  <div className="text-sm text-gray-300 leading-relaxed">
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
                  <div
                    key={tool.id}
                    ref={el => toolRefs.current[tool.id] = el}
                    className="transition-all duration-300"
                  >
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
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-amber-500">⚠️</span>
                Cognitive Biases
                <span className="text-sm text-gray-400">({cognitiveBiases.length})</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cognitiveBiases.map((tool, index) => (
                  <div
                    key={tool.id}
                    ref={el => toolRefs.current[tool.id] = el}
                    className="transition-all duration-300"
                  >
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

      {/* Upgrade Prompt - Show only for truly free users (not those seeing premium content) */}
      {displayTier === 'free' && !showPremiumFeatures && <UpgradePrompt />}

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