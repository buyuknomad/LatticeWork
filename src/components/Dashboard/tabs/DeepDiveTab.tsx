// src/components/Dashboard/tabs/DeepDiveTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Target, Lightbulb, Search, Clock } from 'lucide-react';
import { RecommendedTool, ActionPlan, SearchGrounding, UserTier } from '../types';
import ToolCard from '../ToolCard';
import { useResponsive } from '../../../hooks/useResponsive';

interface DeepDiveTabProps {
  tools: RecommendedTool[];
  actionPlan?: ActionPlan;
  keyLessons?: string[];
  searchGrounding?: SearchGrounding;
  displayTier: UserTier;
}

const DeepDiveTab: React.FC<DeepDiveTabProps> = ({
  tools,
  actionPlan,
  keyLessons,
  searchGrounding,
  displayTier
}) => {
  const { isMobile } = useResponsive();
  
  // Separate tools by type
  const mentalModels = tools.filter(t => t.type === 'mental_model');
  const cognitiveBiases = tools.filter(t => t.type === 'cognitive_bias');

  return (
    <div className="space-y-8">
      {/* Search Grounding Badge */}
      {searchGrounding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#252525]/50 rounded-full border border-[#333333]">
            <Search className="h-4 w-4 text-[#00FFFF]" />
            <span className="text-sm text-gray-300">
              Enhanced with web search • {searchGrounding.sourcesCount} sources
            </span>
            <span className="text-xs text-gray-500">
              {new Date(searchGrounding.searchTimestamp).toLocaleDateString()}
            </span>
          </div>
        </motion.div>
      )}

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
            <h3 className="text-xl font-semibold">Mental Models</h3>
            <span className="ml-auto text-sm text-gray-400">
              {mentalModels.length} model{mentalModels.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className={`
            ${mentalModels.length === 1 
              ? 'max-w-3xl mx-auto' 
              : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
            }
          `}>
            {mentalModels.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Cognitive Biases Section */}
      {cognitiveBiases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold">Cognitive Biases</h3>
            <span className="ml-auto text-sm text-gray-400">
              {cognitiveBiases.length} bias{cognitiveBiases.length > 1 ? 'es' : ''}
            </span>
          </div>
          
          <div className={`
            ${cognitiveBiases.length === 1 
              ? 'max-w-3xl mx-auto' 
              : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
            }
          `}>
            {cognitiveBiases.map((tool, index) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                index={mentalModels.length + index} 
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Complete Action Plan */}
      {actionPlan && displayTier === 'premium' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/80 rounded-2xl p-6 md:p-8 border border-[#333333]/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/10 rounded-xl">
                <Target className="h-6 w-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-semibold">Complete Action Plan</h3>
              <span className="ml-auto text-xs px-3 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full font-medium">
                {actionPlan.type}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {actionPlan.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-[#1A1A1A]/50 rounded-xl p-5 border border-[#333333]/30"
                >
                  <h4 className="font-semibold text-[#8B5CF6] mb-3 flex items-center gap-2">
                    <span className="text-lg">
                      {index === 0 ? '🎯' : index === 1 ? '🚀' : '💡'}
                    </span>
                    {section.sectionName}
                  </h4>
                  <ul className="space-y-2">
                    {section.actionItems.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <span className="text-[#8B5CF6] mt-0.5 flex-shrink-0">→</span>
                        <span className="text-sm text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Lessons */}
      {keyLessons && keyLessons.length > 0 && displayTier === 'premium' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-br from-[#1F1F1F]/80 to-[#252525]/80 rounded-2xl p-6 md:p-8 border border-[#333333]/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
                <Lightbulb className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold">Key Takeaways</h3>
              <span className="ml-auto text-sm text-gray-400">
                {keyLessons.length} lesson{keyLessons.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyLessons.map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-[#1A1A1A]/50 rounded-lg border border-amber-500/20 hover:border-amber-500/30 transition-colors"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center text-sm font-semibold text-amber-500">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">{lesson}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Free Tier Upgrade Prompt */}
      {displayTier === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B5CF6]/10 rounded-full mb-4">
            <Target className="h-8 w-8 text-[#8B5CF6]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Unlock Complete Action Plans</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Premium members get detailed action plans, key lessons, and deeper analysis tools
          </p>
        </motion.div>
      )}

      {/* Metadata Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-8 border-t border-[#333333]/50"
      >
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Analysis generated {new Date().toLocaleDateString()}</span>
          </div>
          {searchGrounding && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>Enhanced with current data</span>
              </div>
            </>
          )}
          <span>•</span>
          <span className="text-[#00FFFF]">
            {tools.length} pattern{tools.length > 1 ? 's' : ''} identified
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default DeepDiveTab;