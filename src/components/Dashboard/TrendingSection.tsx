// src/components/Dashboard/TrendingSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronRight, ChevronDown, Globe } from 'lucide-react';
import { TrendingQuestion, UserTier } from './types';

interface TrendingSectionProps {
  trendingQuestions: TrendingQuestion[];
  loadingTrending: boolean;
  displayTier: UserTier;
  onTrendingClick: (question: TrendingQuestion) => void;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingQuestions,
  loadingTrending,
  displayTier,
  onTrendingClick,
}) => {
  const [showAll, setShowAll] = useState(false);
  const questionsToShow = showAll ? trendingQuestions : trendingQuestions.slice(0, 6);

  const getCategoryColor = (category: string) => {
    const colors = {
      business: '#10B981',
      technology: '#8B5CF6',
      personal: '#F59E0B', 
      society: '#3B82F6',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  if (loadingTrending) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        <div className="bg-[#1F1F1F]/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#00FFFF]/10 rounded-lg">
              <Globe className="h-5 w-5 text-[#00FFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Current Events & Trending Topics</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Updated every 3 days
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-[#252525]/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  if (trendingQuestions.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <div className="bg-[#1F1F1F]/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FFFF]/10 rounded-lg">
              <Globe className="h-5 w-5 text-[#00FFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Current Events & Trending Topics</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                What's happening in the world • Updated every 3 days
              </p>
            </div>
          </div>
          
          {trendingQuestions.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-[#00FFFF] hover:text-[#00FFFF]/80 flex items-center gap-1 transition-colors"
            >
              {showAll ? 'Show Less' : `View All (${trendingQuestions.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {questionsToShow.map((question, index) => (
              <motion.button
                key={question.id}
                onClick={() => onTrendingClick(question)}
                className="group relative text-left p-4 bg-[#252525]/50 hover:bg-[#252525]/80 border border-[#333333] hover:border-[#00FFFF]/30 rounded-xl transition-all duration-200 overflow-hidden min-h-[120px] flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Category Dot */}
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(question.category) }}
                  />
                  <span className="text-xs text-gray-500 capitalize">{question.category}</span>
                </div>

                {/* Question Text - No line clamp, show full text */}
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1 mb-3">
                  {question.question}
                </p>

                {/* Bottom Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  <span className="truncate max-w-[60%]" title={question.topic_source}>
                    {question.topic_source}
                  </span>
                  <span className="flex items-center gap-1">
                    {question.click_count > 0 && (
                      <>
                        <span>{question.click_count}</span>
                        <span>views</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-[#00FFFF]" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Helper Text - Updated for accuracy */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {displayTier === 'free' 
              ? 'Click any pattern to use your daily analysis'
              : 'Click any pattern for detailed analysis'
            }
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default TrendingSection;