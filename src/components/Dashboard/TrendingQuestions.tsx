// src/components/Dashboard/TrendingQuestions.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Crown, ChevronDown, ChevronUp, 
  Flame, MessageCircle, ArrowUp, Clock, Zap 
} from 'lucide-react';
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
  const [showAll, setShowAll] = useState(false);
  const questionsToShow = showAll ? trendingQuestions : trendingQuestions.slice(0, 6);

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

  const getRecencyBadge = (question: TrendingQuestion) => {
    const metadata = question.metadata;
    if (!metadata) return null;

    if (metadata.recency === 'now' || metadata.recency === 'today') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#00FFFF]/20 rounded-full">
          <Clock className="w-3 h-3 text-[#00FFFF]" />
          <span className="text-xs text-[#00FFFF] font-medium">Today</span>
        </div>
      );
    }
    return null;
  };

  // Count hot topics
  const hotTopicsCount = trendingQuestions.filter(q => 
    q.metadata?.isHot || (q.metadata?.engagement && q.metadata.engagement > 500)
  ).length;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#00FFFF]" />
          <p className="text-sm font-medium text-[#00FFFF]">Trending Patterns</p>
          {hotTopicsCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-400 font-medium">{hotTopicsCount} hot</span>
            </div>
          )}
        </div>
        {trendingQuestions.length > 0 && (
          <p className="text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(trendingQuestions[0].created_at))} ago
          </p>
        )}
      </div>
      
      {loadingTrending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1A1A1A]/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {questionsToShow.map((trending, index) => {
                const isHot = trending.metadata?.isHot || (trending.metadata?.engagement && trending.metadata.engagement > 500);
                
                return (
                  <motion.button
                    key={trending.id}
                    onClick={() => onTrendingClick(trending)}
                    className={`text-left p-4 rounded-lg transition-all duration-200 group relative min-h-[120px] ${
                      isHot 
                        ? 'bg-gradient-to-r from-orange-900/20 to-orange-800/10 border border-orange-500/30 hover:border-orange-500/50' 
                        : 'bg-gradient-to-r from-[#1A1A1A]/50 to-[#1A1A1A]/30 border border-[#333333] hover:border-[#00FFFF]/30'
                    } hover:from-[#252525]/80 hover:to-[#252525]/60`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    {/* Header with category and badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getCategoryStyles(trending.category)}`}>
                          {trending.category}
                        </span>
                        {getRecencyBadge(trending)}
                        {isHot && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-orange-400 font-medium">Hot</span>
                          </div>
                        )}
                      </div>
                      
                      {displayTier === 'free' && (
                        <span className="text-xs px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full flex items-center gap-1 flex-shrink-0">
                          <Crown size={10} />
                          <span>Premium</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Question text - removed line-clamp to show full question */}
                    <p className={`text-sm transition-colors mb-3 ${
                      isHot 
                        ? 'text-gray-200 group-hover:text-white font-medium' 
                        : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {trending.question}
                    </p>
                    
                    {/* Source and metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <span className="truncate max-w-[120px]" title={trending.topic_source}>
                        {trending.topic_source}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        {trending.metadata?.engagement > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>
                              {trending.metadata.engagement > 1000 
                                ? `${(trending.metadata.engagement / 1000).toFixed(1)}k` 
                                : trending.metadata.engagement}
                            </span>
                          </div>
                        )}
                        {trending.metadata?.score > 0 && (
                          <div className="flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            <span>
                              {trending.metadata.score > 1000 
                                ? `${(trending.metadata.score / 1000).toFixed(1)}k` 
                                : trending.metadata.score}
                            </span>
                          </div>
                        )}
                        {trending.click_count > 0 && (
                          <span className="flex-shrink-0">{trending.click_count} views</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Hot topic glow effect */}
                    {isHot && (
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none rounded-lg" />
                    )}
                    
                    {/* Hover indicator for premium users */}
                    {displayTier === 'premium' && (
                      <div className="absolute inset-0 rounded-lg border-2 border-[#00FFFF] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Show More/Less Button */}
          {trendingQuestions.length > 6 && (
            <motion.button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2 text-sm text-[#00FFFF] hover:text-[#00FFFF]/80 flex items-center justify-center gap-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showAll ? (
                <>Show Less <ChevronUp size={16} /></>
              ) : (
                <>Show {trendingQuestions.length - 6} More <ChevronDown size={16} /></>
              )}
            </motion.button>
          )}
        </>
      )}
      
      {/* Helper text based on tier */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        {displayTier === 'free' 
          ? hotTopicsCount > 0 
            ? `${hotTopicsCount} trending topics • You have 1 free analysis per day`
            : 'You have 1 free analysis per day • Use it on any question'
          : `Click any trending pattern for instant analysis${hotTopicsCount > 0 ? ` • ${hotTopicsCount} hot topics` : ''}`
        }
      </p>
    </div>
  );
};

export default TrendingQuestions;