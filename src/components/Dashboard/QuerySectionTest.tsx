// src/components/Dashboard/QuerySectionTest.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingQuestion, UserTier, QueryLimits } from './types';
import SearchSection from './SearchSection';
import TrendingSection from './TrendingSection';
import ExamplesSection from './ExamplesSection';
import { Info } from 'lucide-react';

interface QuerySectionTestProps {
  query: string;
  setQuery: (query: string) => void;
  error: string | null;
  isLoading: boolean;
  isTypingAnimation: boolean;
  animatedPlaceholder: string;
  trendingQuestions: TrendingQuestion[];
  loadingTrending: boolean;
  displayTier: UserTier;
  onSubmit: (e: React.FormEvent) => void;
  onInputFocus: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExampleClick: (example: string) => void;
  onTrendingClick: (question: TrendingQuestion) => void;
  shouldFocusAnalysis: boolean;
  userId?: string;
  limits: QueryLimits;
  showDebugInfo?: boolean;
  testModeEnabled?: boolean;
}

const QuerySectionTest: React.FC<QuerySectionTestProps> = ({
  query,
  setQuery,
  error,
  isLoading,
  isTypingAnimation,
  animatedPlaceholder,
  trendingQuestions,
  loadingTrending,
  displayTier,
  onSubmit,
  onInputFocus,
  onInputChange,
  onExampleClick,
  onTrendingClick,
  shouldFocusAnalysis,
  limits,
  showDebugInfo = false,
  testModeEnabled = false,
}) => {
  const handleClearQuery = () => {
    setQuery('');
  };

  return (
    <div className="w-full space-y-8 md:space-y-10">
      {/* NEW: Search Feature Info Banner for Premium Users */}
      {displayTier === 'premium' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">
                🚀 Enhanced with Real-Time Search (v14.2)
              </h4>
              <p className="text-xs text-gray-400">
                Your analyses now include current information from the web when relevant. 
                Questions about recent events, current trends, or specific people/companies 
                will automatically search for the latest context.
              </p>
              {testModeEnabled && (
                <p className="text-xs text-purple-300 mt-2">
                  Test Mode: Search is {showDebugInfo ? 'enabled' : 'disabled'} in test settings.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Query Limits Display for Free Users */}
      {displayTier === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Premium Trending */}
            <div className="bg-[#252525]/50 backdrop-blur-sm rounded-lg p-4 border border-[#333333] hover:border-[#00FFFF]/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Premium Trending</span>
                <span className="text-xs text-[#00FFFF]">
                  {limits.trendingUsed > 0 ? '✓ Used' : '✨ Available'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.max(0, 1 - Math.min(limits.trendingUsed, 1))}/1
              </div>
              <p className="text-xs text-gray-500 mt-1">Full analysis</p>
            </div>
            
            {/* Basic Trending */}
            <div className="bg-[#252525]/50 backdrop-blur-sm rounded-lg p-4 border border-[#333333] hover:border-[#333333]/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Basic Trending</span>
                <span className="text-xs text-gray-400">
                  {limits.trendingUsed > 1 ? '✓ Used' : '📊 Available'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.max(0, 1 - Math.max(0, limits.trendingUsed - 1))}/1
              </div>
              <p className="text-xs text-gray-500 mt-1">Limited analysis</p>
            </div>
            
            {/* Manual Query */}
            <div className="bg-[#252525]/50 backdrop-blur-sm rounded-lg p-4 border border-[#333333] hover:border-[#333333]/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Your Questions</span>
                <span className="text-xs text-gray-400">
                  {limits.manualUsed > 0 ? '✓ Used' : '✍️ Available'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.max(0, limits.manualLimit - limits.manualUsed)}/{limits.manualLimit}
              </div>
              <p className="text-xs text-gray-500 mt-1">Basic analysis</p>
            </div>
          </div>
          
          {/* Reset time info */}
          {limits.resetTime && (limits.trendingUsed > 0 || limits.manualUsed > 0) && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Resets in {Math.ceil((limits.resetTime.getTime() - Date.now()) / (1000 * 60 * 60))} hours
            </p>
          )}
        </motion.div>
      )}

      {/* Search Section */}
      <SearchSection
        query={query}
        error={error}
        isLoading={isLoading}
        isTypingAnimation={isTypingAnimation}
        animatedPlaceholder={animatedPlaceholder}
        displayTier={displayTier}
        remainingQueries={displayTier === 'free' ? limits.manualLimit - limits.manualUsed : undefined}
        queryResetTime={limits.resetTime}
        onSubmit={onSubmit}
        onInputFocus={onInputFocus}
        onInputChange={onInputChange}
        onClearQuery={handleClearQuery}
        shouldFocusAnalysis={shouldFocusAnalysis}
      />

      {/* Trending Section */}
      <TrendingSection
        trendingQuestions={trendingQuestions}
        loadingTrending={loadingTrending}
        displayTier={displayTier}
        onTrendingClick={onTrendingClick}
        limits={limits}
      />

      {/* Examples Section */}
      <ExamplesSection
        onExampleClick={onExampleClick}
      />
    </div>
  );
};

export default QuerySectionTest;