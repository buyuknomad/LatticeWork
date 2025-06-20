// src/components/Dashboard/tabs/AnalysisTab.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Target, Brain, AlertTriangle } from 'lucide-react';
import { NarrativeAnalysis, RecommendedTool, UserTier } from '../types';
import { useResponsive } from '../../../hooks/useResponsive';

interface AnalysisTabProps {
  narrativeAnalysis?: NarrativeAnalysis;
  tools: RecommendedTool[];
  keyLessons?: string[];
  displayTier: UserTier;
}

const AnalysisTab: React.FC<AnalysisTabProps> = ({
  narrativeAnalysis,
  tools,
  keyLessons,
  displayTier
}) => {
  const { isMobile } = useResponsive();
  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set());
  
  // Separate tools by type
  const mentalModels = tools.filter(t => t.type === 'mental_model');
  const cognitiveBiases = tools.filter(t => t.type === 'cognitive_bias');

  // Toggle thread expansion
  const toggleThread = (threadId: number) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };

  // Render basic view for free tier
  if (displayTier === 'free' || !narrativeAnalysis) {
    return (
      <div className="space-y-6">
        {/* Tool Summary Cards */}
        <div className="space-y-4">
          {mentalModels.map((tool, index) => (
            <ToolSummaryCard key={tool.id} tool={tool} index={index} type="model" />
          ))}
          {cognitiveBiases.map((tool, index) => (
            <ToolSummaryCard key={tool.id} tool={tool} index={index + mentalModels.length} type="bias" />
          ))}
        </div>
        
        {/* Upgrade Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8"
        >
          <Sparkles className="h-8 w-8 text-[#8B5CF6] mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Upgrade to Premium for narrative analysis, action plans, and deeper insights
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Narrative Hook */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] px-4">
          {narrativeAnalysis.hook}
        </h2>
      </motion.div>

      {/* Threads */}
      <div className="space-y-3">
        {narrativeAnalysis.threads.map((thread, index) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            index={index}
            isExpanded={!isMobile || expandedThreads.has(thread.id)}
            onToggle={() => toggleThread(thread.id)}
            isMobile={isMobile}
            allTools={tools}
          />
        ))}
      </div>

      {/* Tool Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-[#00FFFF]" />
          Patterns & Biases Identified
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mentalModels.map((tool, index) => (
            <ToolSummaryCard key={tool.id} tool={tool} index={index} type="model" />
          ))}
          {cognitiveBiases.map((tool, index) => (
            <ToolSummaryCard key={tool.id} tool={tool} index={index + mentalModels.length} type="bias" />
          ))}
        </div>
      </motion.div>

      {/* Primary Actions */}
      {narrativeAnalysis.actionPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#252525]/50 rounded-xl p-6 border border-[#333333]"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            {narrativeAnalysis.actionPlan.sections.slice(0, 2).map((section, index) => (
              <div key={index}>
                <h4 className="text-sm font-medium text-[#00FFFF] mb-2">
                  {section.sectionName}
                </h4>
                <ul className="space-y-1">
                  {section.actionItems.slice(0, 2).map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-[#00FFFF] mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            See Deep Dive tab for complete action plan
          </p>
        </motion.div>
      )}

      {/* Bottom Line */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center p-6 bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 rounded-xl border border-[#00FFFF]/20"
      >
        <p className="text-lg md:text-xl font-semibold text-white">
          {narrativeAnalysis.bottomLine}
        </p>
      </motion.div>
    </div>
  );
};

// Thread Card Component
const ThreadCard: React.FC<{
  thread: NarrativeAnalysis['threads'][0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
  allTools: RecommendedTool[];
}> = ({ thread, index, isExpanded, onToggle, isMobile, allTools }) => {
  const getThreadColor = () => {
    switch (thread.type) {
      case 'opening': return 'from-gray-600 to-gray-500';
      case 'pattern': return 'from-[#00FFFF] to-[#00DDDD]';
      case 'insight': return 'from-amber-500 to-amber-400';
      case 'connection': return 'from-[#8B5CF6] to-[#7C3AED]';
      case 'conclusion': return 'from-green-500 to-green-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  const highlightToolNames = (content: string) => {
    let highlightedContent = content;
    thread.tools.forEach(toolName => {
      const regex = new RegExp(`\\b${toolName}\\b`, 'gi');
      highlightedContent = highlightedContent.replace(
        regex,
        `<span class="font-semibold text-[#00FFFF]">${toolName}</span>`
      );
    });
    return highlightedContent;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        bg-[#1F1F1F]/50 rounded-xl border border-[#333333]/50
        ${isMobile ? 'cursor-pointer' : ''}
      `}
      onClick={() => isMobile && onToggle()}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Emoji */}
          <span className="text-2xl flex-shrink-0">{thread.emoji}</span>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Thread Type Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                text-xs px-2 py-0.5 rounded-full font-medium
                bg-gradient-to-r ${getThreadColor()} text-white
              `}>
                {thread.type.charAt(0).toUpperCase() + thread.type.slice(1)}
              </span>
              {thread.tools.length > 0 && (
                <span className="text-xs text-gray-500">
                  {thread.tools.length} tool{thread.tools.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Thread Content */}
            <AnimatePresence>
              <motion.div
                initial={false}
                animate={{ height: isExpanded ? 'auto' : isMobile ? '48px' : 'auto' }}
                className="overflow-hidden"
              >
                <p 
                  className={`text-sm text-gray-300 leading-relaxed ${
                    !isExpanded && isMobile ? 'line-clamp-2' : ''
                  }`}
                  dangerouslySetInnerHTML={{ __html: highlightToolNames(thread.content) }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Expand/Collapse Button (Mobile Only) */}
          {isMobile && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Tool Summary Card Component
const ToolSummaryCard: React.FC<{
  tool: RecommendedTool;
  index: number;
  type: 'model' | 'bias';
}> = ({ tool, index, type }) => {
  const Icon = type === 'model' ? Brain : AlertTriangle;
  const color = type === 'model' ? '#00FFFF' : '#F59E0B';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-4 bg-[#252525]/30 rounded-lg border border-[#333333]/30 hover:border-[#333333]/50 transition-colors"
    >
      <div 
        className="p-2 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <h4 className="font-medium text-sm text-white mb-1">{tool.name}</h4>
        <p className="text-xs text-gray-400 line-clamp-2">{tool.summary}</p>
      </div>
    </motion.div>
  );
};

export default AnalysisTab;