// src/components/Dashboard/TabContainer.tsx - SAFE VERSION
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';
import { LatticeInsightResponse, UserTier, TabType, TabConfig } from './types';
import AnalysisTab from './tabs/AnalysisTab';
import DeepDiveTab from './tabs/DeepDiveTab';

interface TabContainerProps {
  results: LatticeInsightResponse;
  query: string;
  displayTier: UserTier;
}

// Tab configuration
const TAB_CONFIG: Record<TabType, TabConfig> = {
  analysis: {
    id: 'analysis',
    desktop: { icon: '🎯', label: 'Analysis' },
    mobile: { icon: '🎯', label: '' }
  },
  deepDive: {
    id: 'deepDive', 
    desktop: { icon: '📚', label: 'Deep Dive' },
    mobile: { icon: '📚', label: '' }
  }
};

const TabContainer: React.FC<TabContainerProps> = ({
  results,
  query,
  displayTier
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const { isMobile, isTablet } = useResponsive();
  
  // Safety check
  if (!results || !results.recommendedTools || results.recommendedTools.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No analysis results to display</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className={`
        ${isMobile ? 'fixed bottom-0 left-0 right-0 z-40' : 'relative mb-6'}
      `}>
        <div className={`
          flex gap-2 p-1 backdrop-blur-lg
          ${isMobile 
            ? 'bg-[#1A1A1A]/95 border-t border-[#333333]' 
            : 'bg-[#1A1A1A]/50 rounded-xl max-w-md mx-auto'
          }
        `}>
          {Object.entries(TAB_CONFIG).map(([key, config]) => {
            const tabKey = key as TabType;
            const isActive = activeTab === tabKey;
            const tabConfig = isMobile ? config.mobile : config.desktop;
            
            return (
              <motion.button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium transition-all
                  ${isActive 
                    ? 'bg-[#252525] text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-[#252525]/50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2 relative">
                  <span className="text-xl">{tabConfig.icon}</span>
                  {tabConfig.label && (
                    <span className="text-sm font-medium">{tabConfig.label}</span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#00FFFF] rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`
            ${isMobile ? 'pb-24' : ''} // Space for fixed bottom nav on mobile
          `}
        >
          {activeTab === 'analysis' ? (
            <AnalysisTab
              narrativeAnalysis={results.narrativeAnalysis}
              tools={results.recommendedTools}
              keyLessons={results.keyLessons}
              displayTier={displayTier}
            />
          ) : (
            <DeepDiveTab
              tools={results.recommendedTools}
              actionPlan={results.narrativeAnalysis?.actionPlan}
              keyLessons={results.keyLessons}
              searchGrounding={results.searchGrounding}
              displayTier={displayTier}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tab Hint for Desktop */}
      {!isMobile && !isTablet && activeTab === 'analysis' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Want more details? Check out the{' '}
            <button
              onClick={() => setActiveTab('deepDive')}
              className="text-[#00FFFF] hover:text-[#00FFFF]/80 font-medium"
            >
              Deep Dive tab
            </button>
            {' '}for full explanations
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TabContainer;