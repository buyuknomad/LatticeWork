// src/components/Dashboard/QuerySection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrendingQuestions from './TrendingQuestions';
import { TrendingQuestion, UserTier } from './types';

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
}

const EXAMPLE_QUERIES = [
  "Why do I procrastinate even when I know the consequences?",
  "What drives people to repeat the same mistakes?",
  "How do successful investors think differently about risk?",
  "Why do teams fall into predictable conflict patterns?",
];

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
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#333333] relative overflow-hidden">
        {/* Glowing corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#00FFFF]/10 to-transparent rounded-tl-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#8B5CF6]/10 to-transparent rounded-br-2xl pointer-events-none"></div>
        
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            What patterns are you trying to understand?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6">
            Uncover the mental models that explain what's happening and biases that might cloud your view
          </p>

          {/* Pattern Search Input */}
          <form onSubmit={onSubmit}>
            <div className="relative group">
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
              
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-gray-500 h-5 w-5 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={onInputChange}
                  onFocus={onInputFocus}
                  placeholder={isTypingAnimation ? '' : "What patterns or behaviors are puzzling you?"}
                  className="w-full bg-[#1A1A1A]/80 text-white pl-12 pr-12 py-4 rounded-xl border border-[#444444] focus:border-[#00FFFF]/50 focus:outline-none transition-all duration-300"
                  autoFocus={shouldFocusAnalysis}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-12 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className={`absolute right-3 p-1.5 rounded-lg transition-all ${
                    query.trim() 
                      ? 'text-[#00FFFF] hover:bg-[#00FFFF]/10' 
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight size={20} />
                </button>
              </div>

              {/* Animated placeholder */}
              {isTypingAnimation && !query && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-gray-500">{animatedPlaceholder}</span>
                  <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse"></span>
                </div>
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm">{error}</p>
                  {error.includes('Premium feature') && (
                    <Link to="/pricing" className="inline-flex items-center gap-1 mt-2 text-[#8B5CF6] hover:text-[#8B5CF6]/80 text-sm font-medium">
                      Upgrade to Premium <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Trending Patterns Section */}
          <TrendingQuestions
            trendingQuestions={trendingQuestions}
            loadingTrending={loadingTrending}
            displayTier={displayTier}
            onTrendingClick={onTrendingClick}
          />

          {/* Pattern Examples Section */}
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-3">Or explore these common patterns:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLE_QUERIES.map((example, index) => (
                <motion.button
                  key={index}
                  onClick={() => onExampleClick(example)}
                  className="text-left px-4 py-3 bg-[#1A1A1A]/50 hover:bg-[#1A1A1A]/80 border border-[#333333] hover:border-[#00FFFF]/30 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="line-clamp-1">{example}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuerySection;