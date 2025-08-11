// src/components/Analytics/TrendingModels.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Clock, Users, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface TrendingModel {
  model_slug: string;
  model_name: string;
  category: string;
  trending_score: number;
  trending_rank: number;
  trending_direction: 'up' | 'down' | 'stable';
  views_last_24h: number;
  unique_viewers: number;
}

interface TrendingModelsProps {
  limit?: number;
  variant?: 'compact' | 'detailed';
  showStats?: boolean;
  refreshInterval?: number;
}

export const TrendingModels: React.FC<TrendingModelsProps> = ({ 
  limit = 5,
  variant = 'compact',
  showStats = true,
  refreshInterval = 60000 // 1 minute default
}) => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<TrendingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTrending();
    
    // Set up refresh interval
    const interval = setInterval(() => {
      fetchTrending(true);
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [limit, refreshInterval]);

  const fetchTrending = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const { data, error } = await supabase
        .rpc('get_trending_models', { p_limit: limit });

      if (error) throw error;
      
      setTrending(data || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
      setError('Failed to load trending models');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': 
        return (
          <motion.div
            initial={{ y: 2 }}
            animate={{ y: -2 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          >
            <TrendingUp className="w-4 h-4 text-green-400" />
          </motion.div>
        );
      case 'down': 
        return (
          <motion.div
            initial={{ y: -2 }}
            animate={{ y: 2 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          >
            <TrendingDown className="w-4 h-4 text-red-400" />
          </motion.div>
        );
      default: 
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'decision-making': '#00FFFF',
      'problem-solving': '#8B5CF6',
      'systems-thinking': '#FFB84D',
      'mental-models': '#FF6B6B',
      'cognitive-biases': '#4ECDC4',
      'default': '#6B7280'
    };
    return colors[category] || colors.default;
  };

  const handleModelClick = (model: TrendingModel) => {
    navigate(`/mental-models/${model.model_slug}?ref=trending`, {
      state: { from: 'trending' }
    });
  };

  if (loading && !isRefreshing) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4 w-32"></div>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4">
        <div className="text-center text-gray-400">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => fetchTrending()}
            className="mt-2 text-xs text-[#00FFFF] hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!trending.length) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4">
        <div className="text-center text-gray-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No trending models yet</p>
          <p className="text-xs mt-1">Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-[#1a1a1a] rounded-lg p-4 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Trending Models
        </h3>
        
        {/* Refresh indicator */}
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-xs text-gray-500"
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Updating
          </motion.div>
        )}
        
        {/* Last updated time */}
        {!isRefreshing && variant === 'detailed' && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
              Math.round((lastUpdated.getTime() - Date.now()) / 60000),
              'minute'
            )}
          </div>
        )}
      </div>
      
      {/* Trending list */}
      <AnimatePresence mode="wait">
        <motion.div 
          className="space-y-3"
          key={trending.map(m => m.model_slug).join('-')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {trending.map((model, index) => (
            <motion.div
              key={model.model_slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => handleModelClick(model)}
              className="group relative flex items-center justify-between p-3 bg-[#252525] rounded-lg hover:bg-[#2a2a2a] cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Rank badge */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-2xl font-bold text-gray-500">
                    {index + 1}
                  </span>
                  {index === 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                    </motion.div>
                  )}
                </div>
                
                {/* Model info */}
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-[#00FFFF] transition-colors">
                    {model.model_name}
                  </p>
                  
                  {/* Category pill */}
                  {variant === 'detailed' && (
                    <span 
                      className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full opacity-70"
                      style={{
                        backgroundColor: `${getCategoryColor(model.category)}20`,
                        color: getCategoryColor(model.category),
                        border: `1px solid ${getCategoryColor(model.category)}30`
                      }}
                    >
                      {model.category}
                    </span>
                  )}
                  
                  {/* Stats */}
                  {showStats && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye className="w-3 h-3" />
                        {model.views_last_24h}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        {model.unique_viewers}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Trend indicator */}
              <div className="flex items-center gap-2">
                {variant === 'detailed' && (
                  <span className="text-xs text-gray-500">
                    Score: {model.trending_score}
                  </span>
                )}
                {getTrendIcon(model.trending_direction)}
              </div>
              
              {/* Hover effect gradient */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      
      {/* View all link */}
      {variant === 'compact' && (
        <motion.div 
          className="mt-4 pt-3 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/mental-models?sort=trending')}
            className="w-full text-center text-sm text-[#00FFFF] hover:text-white transition-colors py-2 rounded hover:bg-[#252525]"
          >
            View All Trending Models →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

// Export variant for dashboard widget
export const TrendingModelsWidget: React.FC = () => (
  <TrendingModels 
    limit={5} 
    variant="compact" 
    showStats={true}
    refreshInterval={60000}
  />
);

// Export variant for full page
export const TrendingModelsFull: React.FC = () => (
  <TrendingModels 
    limit={10} 
    variant="detailed" 
    showStats={true}
    refreshInterval={30000}
  />
);

export default TrendingModels;