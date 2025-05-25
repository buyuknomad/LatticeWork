// src/components/Dashboard/QuerySection.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { TrendingQuestion, UserTier } from './types';
import SearchSection from './SearchSection';
import TrendingSection from './TrendingSection';
import ExamplesSection from './ExamplesSection';

interface QuerySectionProps {
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
}

const QuerySection: React.FC<QuerySectionProps> = ({
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
  userId,
}) => {
  const [remainingQueries, setRemainingQueries] = useState<number | undefined>();
  const [queryResetTime, setQueryResetTime] = useState<Date | undefined>();

  // Calculate remaining queries for free users
  useEffect(() => {
    if (displayTier === 'free' && userId) {
      calculateRemainingQueries();
    }
  }, [displayTier, userId, error]);

  const calculateRemainingQueries = async () => {
    if (!userId) return;

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { count, error: queryCountError } = await supabase
        .from('query_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (!queryCountError && count !== null) {
        const remaining = Math.max(0, 1 - count);
        setRemainingQueries(remaining);
        
        // Set reset time to 24 hours from the first query
        if (count > 0) {
          const { data: firstQuery } = await supabase
            .from('query_history')
            .select('created_at')
            .eq('user_id', userId)
            .gte('created_at', twentyFourHoursAgo.toISOString())
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
            
          if (firstQuery) {
            const resetTime = new Date(firstQuery.created_at);
            resetTime.setHours(resetTime.getHours() + 24);
            setQueryResetTime(resetTime);
          }
        }
      }
    } catch (error) {
      console.error('Error calculating remaining queries:', error);
    }
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  return (
    <div className="w-full space-y-8 md:space-y-10">
      {/* Search Section - Primary Focus */}
      <SearchSection
        query={query}
        error={error}
        isLoading={isLoading}
        isTypingAnimation={isTypingAnimation}
        animatedPlaceholder={animatedPlaceholder}
        displayTier={displayTier}
        remainingQueries={remainingQueries}
        queryResetTime={queryResetTime}
        onSubmit={onSubmit}
        onInputFocus={onInputFocus}
        onInputChange={onInputChange}
        onClearQuery={handleClearQuery}
        shouldFocusAnalysis={shouldFocusAnalysis}
      />

      {/* Trending Section - Secondary */}
      <TrendingSection
        trendingQuestions={trendingQuestions}
        loadingTrending={loadingTrending}
        displayTier={displayTier}
        onTrendingClick={onTrendingClick}
      />

      {/* Examples Section - Tertiary but still visible */}
      <ExamplesSection
        onExampleClick={onExampleClick}
      />
    </div>
  );
};

export default QuerySection;