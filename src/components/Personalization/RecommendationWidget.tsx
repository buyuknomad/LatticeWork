// src/components/Personalization/RecommendationWidget.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Brain, 
  ChevronRight,
  RefreshCw,
  Info,
  X,
  BookOpen,
  Clock,
  Users,
  Star,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RecommendationItem {
  slug: string;
  name: string;
  category: string;
  core_concept?: string;
  view_count?: number;
  avg_duration?: number;
  trending_score?: number;
  reason?: string;
  type?: 'similar' | 'trending' | 'popular' | 'new' | 'collaborative' | 'continue';
}

interface RecommendationWidgetProps {
  title?: string;
  subtitle?: string;
  modelSlug?: string;
  category?: string;
  limit?: number;
  showRefresh?: boolean;
  variant?: 'compact' | 'detailed' | 'card';
  className?: string;
  onModelClick?: (slug: string) => void;
}

const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  title = "Recommended for You",
  subtitle,
  modelSlug,
  category,
  limit = 4,
  showRefresh = true,
  variant = 'compact',
  className = '',
  onModelClick
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setError(null);
      let data: any[] = [];

      if (modelSlug) {
        // Get related models based on a specific model
        const { data: modelData, error: modelError } = await supabase
          .from('mental_models_library')  // FIXED: correct table name
          .select('category, related_model_slugs')
          .eq('slug', modelSlug)  // FIXED: using slug column
          .maybeSingle();

        if (modelError) {
          console.error('Error fetching model data:', modelError);
        }

        if (modelData) {
          // Fetch related models
          const relatedSlugs = modelData.related_model_slugs || [];
          
          if (relatedSlugs.length > 0) {
            const { data: relatedModels, error: relatedError } = await supabase
              .from('mental_models_library')  // FIXED: correct table name
              .select('slug, name, category, core_concept')
              .in('slug', relatedSlugs)
              .limit(limit);

            if (!relatedError && relatedModels) {
              data = relatedModels.map(m => ({
                ...m,
                reason: 'Related model',
                type: 'similar' as const
              }));
            }
          }

          // If not enough related models, add from same category
          if (data.length < limit) {
            const { data: categoryModels, error: catError } = await supabase
              .from('mental_models_library')  // FIXED: correct table name
              .select('slug, name, category, core_concept')
              .eq('category', modelData.category)
              .neq('slug', modelSlug)
              .limit(limit - data.length);

            if (!catError && categoryModels) {
              data = [...data, ...categoryModels.map(m => ({
                ...m,
                reason: 'Same category',
                type: 'similar' as const
              }))];
            }
          }
        }
      } else if (category) {
        // Get models from a specific category
        const { data: categoryModels, error } = await supabase
          .from('mental_models_library')  // FIXED: correct table name
          .select('slug, name, category, core_concept')
          .eq('category', category)
          .limit(limit);

        if (!error && categoryModels) {
          data = categoryModels.map(m => ({
            ...m,
            reason: 'In this category',
            type: 'similar' as const
          }));
        }
      } else if (user?.id) {
        // Get personalized recommendations for the user
        try {
          const { data: recData, error: recError } = await supabase
            .rpc('get_user_recommendations', {
              p_user_id: user.id,
              p_limit: limit
            });

          if (recError) {
            console.error('Error fetching user recommendations:', recError);
            // Fall back to trending if personalized recommendations fail
            const { data: trendingData, error: trendingError } = await supabase
              .rpc('calculate_trending_scores')
              .limit(limit);

            if (!trendingError && trendingData) {
              data = trendingData.map((model: any) => ({
                slug: model.slug,  // RPC returns 'slug' directly
                name: model.name,
                category: model.category,
                core_concept: model.core_concept,
                view_count: model.view_count,
                trending_score: model.trending_score,
                reason: 'Trending now',
                type: 'trending' as const
              }));
            } else {
              // Final fallback: get random popular models
              const { data: popularModels } = await supabase
                .from('mental_models_library')  // FIXED: correct table name
                .select('slug, name, category, core_concept')
                .limit(limit);

              if (popularModels) {
                data = popularModels.map(m => ({
                  ...m,
                  reason: 'Popular choice',
                  type: 'popular' as const
                }));
              }
            }
          } else if (recData && recData.length > 0) {
            data = recData.map((rec: any) => {
              let type: RecommendationItem['type'] = 'similar';
              let reason = 'Recommended';

              if (rec.trending_score > 0.7) {
                type = 'trending';
                reason = 'Trending now';
              } else if (rec.view_count > 100) {
                type = 'popular';
                reason = 'Popular choice';
              } else if (!rec.view_count || rec.view_count === 0) {
                type = 'new';
                reason = 'New to explore';
              } else {
                type = 'collaborative';
                reason = 'Others also liked';
              }

              return {
                slug: rec.model_slug,  // RPC returns model_slug, map to slug
                name: rec.model_name,
                category: rec.category,
                core_concept: rec.core_concept,
                view_count: rec.view_count,
                avg_duration: rec.avg_duration,
                trending_score: rec.trending_score,
                reason,
                type
              };
            });
          }
        } catch (rpcError) {
          console.error('RPC error, falling back to basic recommendations:', rpcError);
          // Fallback to basic recommendations
          const { data: fallbackModels } = await supabase
            .from('mental_models_library')  // FIXED: correct table name
            .select('slug, name, category, core_concept')
            .limit(limit);

          if (fallbackModels) {
            data = fallbackModels.map(m => ({
              ...m,
              reason: 'Explore',
              type: 'new' as const
            }));
          }
        }
      } else {
        // No user, show trending or popular models
        try {
          const { data: trending, error: trendingError } = await supabase
            .rpc('calculate_trending_scores')
            .limit(limit);

          if (!trendingError && trending) {
            data = trending.map((model: any) => ({
              slug: model.slug,  // RPC returns 'slug' directly
              name: model.name,
              category: model.category,
              core_concept: model.core_concept,
              view_count: model.view_count,
              trending_score: model.trending_score,
              reason: 'Trending',
              type: 'trending' as const
            }));
          }
        } catch {
          // If trending function doesn't exist, get random models
          const { data: randomModels } = await supabase
            .from('mental_models_library')  // FIXED: correct table name
            .select('slug, name, category, core_concept')
            .limit(limit);

          if (randomModels) {
            data = randomModels.map(m => ({
              ...m,
              reason: 'Discover',
              type: 'new' as const
            }));
          }
        }
      }

      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Unable to load recommendations. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [modelSlug, category, user?.id, limit]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRecommendations();
  };

  const handleModelClick = (slug: string) => {
    if (onModelClick) {
      onModelClick(slug);
    } else {
      navigate(`/mental-models/${slug}`);  // FIXED: using slug
    }
  };

  const getTypeIcon = (type?: RecommendationItem['type']) => {
    switch (type) {
      case 'trending':
        return TrendingUp;
      case 'popular':
        return Users;
      case 'new':
        return Sparkles;
      case 'collaborative':
        return Star;
      case 'continue':
        return Clock;
      default:
        return Brain;
    }
  };

  const getTypeColor = (type?: RecommendationItem['type']) => {
    switch (type) {
      case 'trending':
        return 'text-[#FFB84D]';
      case 'popular':
        return 'text-[#8B5CF6]';
      case 'new':
        return 'text-[#10B981]';
      case 'collaborative':
        return 'text-[#EC4899]';
      case 'continue':
        return 'text-[#3B82F6]';
      default:
        return 'text-[#00FFFF]';
    }
  };

  // Format category name for display
  const formatCategory = (cat: string) => {
    if (!cat) return 'General';
    return cat.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className={`bg-[#252525] rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-[#1A1A1A] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-[#1A1A1A] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-gray-400 mb-3">{error}</p>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 text-center ${className}`}>
        <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No recommendations available</p>
        <p className="text-gray-500 text-sm mt-2">
          {user ? 'Start exploring models to get personalized recommendations' : 'Login to see personalized recommendations'}
        </p>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-[#252525] rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleModelClick(rec.slug)}
              className="flex items-center justify-between p-2 hover:bg-[#1A1A1A] rounded-lg cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                {React.createElement(getTypeIcon(rec.type), {
                  className: `w-4 h-4 ${getTypeColor(rec.type)}`
                })}
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {rec.name}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#00FFFF] transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleModelClick(rec.slug)}
              className="p-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-lg cursor-pointer group transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(getTypeIcon(rec.type), {
                      className: `w-5 h-5 ${getTypeColor(rec.type)}`
                    })}
                    <h4 className="font-medium text-white group-hover:text-[#00FFFF] transition-colors">
                      {rec.name}
                    </h4>
                  </div>
                  {rec.core_concept && (
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {rec.core_concept}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {formatCategory(rec.category)}
                    </span>
                    {rec.view_count !== undefined && rec.view_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {rec.view_count} views
                      </span>
                    )}
                    {rec.avg_duration && rec.avg_duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(rec.avg_duration)}s avg
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#00FFFF] transition-colors mt-1" />
              </div>
              {rec.reason && (
                <div className="mt-2 inline-block">
                  <span className="text-xs px-2 py-1 bg-[#252525] rounded-full text-gray-400">
                    {rec.reason}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-[#252525] rounded-lg transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleModelClick(rec.slug)}
            onMouseEnter={() => setShowTooltip(rec.slug)}
            onMouseLeave={() => setShowTooltip(null)}
            className="bg-[#252525] rounded-lg p-4 cursor-pointer hover:bg-[#2A2A2A] transition-all group relative"
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip === rec.slug && rec.core_concept && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-[#1A1A1A] rounded-lg shadow-xl z-10"
                >
                  <p className="text-xs text-gray-300">{rec.core_concept}</p>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#1A1A1A]"></div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-start justify-between mb-3">
              {React.createElement(getTypeIcon(rec.type), {
                className: `w-6 h-6 ${getTypeColor(rec.type)}`
              })}
              <span className={`text-xs px-2 py-1 rounded-full bg-[#1A1A1A] ${getTypeColor(rec.type)}`}>
                {rec.reason}
              </span>
            </div>
            <h4 className="font-medium text-white group-hover:text-[#00FFFF] transition-colors mb-2">
              {rec.name}
            </h4>
            <p className="text-xs text-gray-400">
              {formatCategory(rec.category)}
            </p>
            {(rec.view_count !== undefined || rec.trending_score) && (
              <div className="mt-3 pt-3 border-t border-[#1A1A1A] flex items-center justify-between text-xs text-gray-500">
                {rec.view_count !== undefined && rec.view_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {rec.view_count}
                  </span>
                )}
                {rec.trending_score && rec.trending_score > 0 && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {Math.round(rec.trending_score * 100)}%
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationWidget;