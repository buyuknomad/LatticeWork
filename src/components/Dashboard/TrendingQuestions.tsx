// src/components/Dashboard/TrendingQuestions.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TrendingQuestion, UserTier } from './types';

interface TrendingQuestionsProps {
  trendingQuestions: TrendingQuestion[];
  loadingTrending: boolean;
  displayTier: UserTier;
  onTrendingClick: (question: TrendingQuestion) => void;
}

const TrendingQuestions: React.FC<TrendingQuestionsProps> = ({
  trendingQuestions,
  loadingTrending,
  displayTier,
  onTrendingClick,
}) => {
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-green-500/10 text-green-400';
      case 'technology':
        return 'bg-purple-500/10 text-purple-400';
      case 'personal':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'society':
        return 'bg-blue-500/10 text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#00FFFF]" />
          <p className="text-sm font-medium text-[#00FFFF]">Trending Patterns</p>
          {displayTier === 'free' && (
            <span className="text-xs px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full flex items-center gap-1">
              <Crown size={10} />
              Premium
            </span>
          )}
        </div>
        {trendingQuestions.length > 0 && (
          <p className="text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(trendingQuestions[0].created_at))} ago
          </p>
        )}
      </div>
      
      {loadingTrending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-[#1A1A1A]/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trendingQuestions.map((trending, index) => (
              <motion.button
                key={trending.id}
                onClick={() => onTrendingClick(trending)}
                className={`relative text-left px-4 py-3 bg-gradient-to-r from-[#1A1A1A]/50 to-[#1A1A1A]/30 hover:from-[#252525]/80 hover:to-[#252525]/60 border rounded-lg text-sm transition-all duration-200 group ${
                  displayTier === 'premium' 
                    ? 'border-[#333333] hover:border-[#00FFFF]/30' 
                    : 'border-[#333333] hover:border-[#8B5CF6]/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Premium/Hot badge */}
                <div className={`absolute -top-1 -right-1 px-2 py-0.5 text-xs font-medium rounded-full transition-opacity ${
                  displayTier === 'premium'
                    ? 'bg-[#00FFFF] text-[#1A1A1A] opacity-0 group-hover:opacity-100'
                    : 'bg-[#8B5CF6] text-white opacity-100 flex items-center gap-1'
                }`}>
                  {displayTier === 'premium' ? '🔥 Trending' : (
                    <>
                      <Crown size={10} />
                      <span>Premium</span>
                    </>
                  )}
                </div>
                
                {/* Question text */}
                <span className="text-gray-300 group-hover:text-white line-clamp-2 transition-colors">
                  {trending.question}
                </span>
                
                {/* Category and metadata */}
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryStyles(trending.category)}`}>
                    {trending.category}
                  </span>
                  
                  {/* Source - always visible but subtle, with separator */}
                  <span className="text-xs text-gray-500">•</span>
                  <span 
                    className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[180px]"
                    title={trending.topic_source}
                  >
                    {trending.topic_source}
                  </span>
                  
                  {trending.click_count > 0 && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {trending.click_count}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
      
      {/* Free user helper text */}
      {displayTier === 'free' && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          Click to explore • Premium members get instant pattern analysis
        </p>
      )}
    </div>
  );
};

export default TrendingQuestions;