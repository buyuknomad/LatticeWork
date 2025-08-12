// src/components/Personalization/PersonalizedDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  BookOpen,
  Sparkles,
  ChevronRight,
  RefreshCw,
  User,
  BarChart3,
  Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MentalModel, MentalModelCategory, CATEGORY_METADATA } from '../../types/mentalModels';

interface PersonalizedStats {
  totalModelsViewed: number;
  favoriteCategory: string;
  learningStreak: number;
  completionRate: number;
  totalTimeSpent: number;
  lastActivityDate: string;
  topCategories: { category: string; count: number; percentage: number }[];
  recentModels: { slug: string; name: string; category: string; viewedAt: string }[];
}

interface Recommendation {
  model_slug: string;
  model_name: string;
  category: string;
  reason: string;
  score: number;
  type: 'continue' | 'similar' | 'trending' | 'complementary' | 'new';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  target: number;
}

const PersonalizedDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<PersonalizedStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch user stats
  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      // Get user's viewing history
      const { data: views, error: viewsError } = await supabase
        .from('mental_model_views')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (viewsError) throw viewsError;

      if (views && views.length > 0) {
        // Calculate stats
        const uniqueModels = new Set(views.map(v => v.model_slug));
        const totalModelsViewed = uniqueModels.size;

        // Calculate category distribution
        const categoryCount: Record<string, number> = {};
        views.forEach(v => {
          if (v.category) {
            categoryCount[v.category] = (categoryCount[v.category] || 0) + 1;
          }
        });

        // Get top categories
        const topCategories = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / views.length) * 100)
          }));

        const favoriteCategory = topCategories[0]?.category || '';

        // Calculate learning streak (days with activity)
        const activityDates = new Set(
          views.map(v => new Date(v.created_at).toDateString())
        );
        const learningStreak = activityDates.size;

        // Calculate total time spent
        const totalTimeSpent = views.reduce((sum, v) => sum + (v.view_duration || 0), 0);

        // Get recent models
        const recentModels = views
          .slice(0, 5)
          .map(v => ({
            slug: v.model_slug,
            name: v.model_slug.split('-').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' '),
            category: v.category || '',
            viewedAt: v.created_at
          }));

        // Calculate completion rate (models with >30s view time)
        const completedViews = views.filter(v => v.view_duration >= 30).length;
        const completionRate = Math.round((completedViews / views.length) * 100);

        setStats({
          totalModelsViewed,
          favoriteCategory,
          learningStreak,
          completionRate,
          totalTimeSpent,
          lastActivityDate: views[0]?.created_at || new Date().toISOString(),
          topCategories,
          recentModels
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Fetch personalized recommendations
  const fetchRecommendations = async () => {
    if (!user?.id) return;

    try {
      // Call the database function for recommendations
      const { data, error } = await supabase
        .rpc('get_user_recommendations', {
          p_user_id: user.id,
          p_limit: 12
        });

      if (error) throw error;

      if (data) {
        // Process and categorize recommendations
        const processedRecs = data.map((rec: any) => {
          let type: Recommendation['type'] = 'similar';
          let reason = 'Recommended for you';

          // Determine recommendation type and reason
          if (rec.view_count === 0) {
            type = 'new';
            reason = 'New model to explore';
          } else if (rec.trending_score > 0.7) {
            type = 'trending';
            reason = 'Trending in your interests';
          } else if (rec.category === stats?.favoriteCategory) {
            type = 'similar';
            reason = `Similar to your favorite category`;
          } else {
            type = 'complementary';
            reason = 'Expand your knowledge';
          }

          return {
            model_slug: rec.model_slug,
            model_name: rec.model_name,
            category: rec.category,
            reason,
            score: rec.score || 0,
            type
          };
        });

        // Sort by score and type priority
        const typePriority = { continue: 1, similar: 2, trending: 3, complementary: 4, new: 5 };
        processedRecs.sort((a, b) => {
          if (a.type !== b.type) {
            return typePriority[a.type] - typePriority[b.type];
          }
          return b.score - a.score;
        });

        setRecommendations(processedRecs);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      
      // Fallback to basic recommendations based on trending
      try {
        const { data: trending } = await supabase
          .rpc('calculate_trending_scores')
          .limit(6);

        if (trending) {
          setRecommendations(
            trending.map((model: any) => ({
              model_slug: model.slug,
              model_name: model.name,
              category: model.category,
              reason: 'Popular right now',
              score: model.trending_score,
              type: 'trending' as const
            }))
          );
        }
      } catch (fallbackError) {
        console.error('Fallback recommendations failed:', fallbackError);
      }
    }
  };

  // Calculate achievements
  const calculateAchievements = () => {
    if (!stats) return;

    const achievementsList: Achievement[] = [
      {
        id: 'explorer',
        title: 'Mental Model Explorer',
        description: 'View 10 different models',
        icon: Brain,
        unlocked: stats.totalModelsViewed >= 10,
        progress: stats.totalModelsViewed,
        target: 10
      },
      {
        id: 'dedicated',
        title: 'Dedicated Learner',
        description: 'Learn for 7 days straight',
        icon: Award,
        unlocked: stats.learningStreak >= 7,
        progress: stats.learningStreak,
        target: 7
      },
      {
        id: 'focused',
        title: 'Deep Focus',
        description: 'Spend 30+ minutes learning',
        icon: Clock,
        unlocked: stats.totalTimeSpent >= 1800,
        progress: Math.floor(stats.totalTimeSpent / 60),
        target: 30
      },
      {
        id: 'diverse',
        title: 'Knowledge Diversity',
        description: 'Explore 5 different categories',
        icon: Sparkles,
        unlocked: stats.topCategories.length >= 5,
        progress: stats.topCategories.length,
        target: 5
      },
      {
        id: 'completion',
        title: 'Thorough Reader',
        description: '80% completion rate',
        icon: Target,
        unlocked: stats.completionRate >= 80,
        progress: stats.completionRate,
        target: 80
      }
    ];

    setAchievements(achievementsList);
  };

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchUserStats(),
      fetchRecommendations()
    ]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchUserStats();
      await fetchRecommendations();
      setIsLoading(false);
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Calculate achievements when stats change
  useEffect(() => {
    calculateAchievements();
  }, [stats]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserStats();
      fetchRecommendations();
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Filter recommendations by category
  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') return recommendations;
    return recommendations.filter(rec => rec.category === selectedCategory);
  }, [recommendations, selectedCategory]);

  // Get unique categories from recommendations
  const availableCategories = useMemo(() => {
    const categories = new Set(recommendations.map(r => r.category));
    return ['all', ...Array.from(categories)];
  }, [recommendations]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] bg-clip-text text-transparent">
                Your Learning Journey
              </h1>
              <p className="text-gray-400">
                Personalized recommendations based on your learning patterns
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-[#252525] rounded-lg hover:bg-[#2A2A2A] transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#252525] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-[#00FFFF]" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalModelsViewed}</div>
              <div className="text-sm text-gray-400">Models Explored</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#252525] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-[#FFB84D]" />
                <span className="text-xs text-gray-400">Streak</span>
              </div>
              <div className="text-2xl font-bold">{stats.learningStreak}</div>
              <div className="text-sm text-gray-400">Day{stats.learningStreak !== 1 ? 's' : ''} Active</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#252525] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-[#10B981]" />
                <span className="text-xs text-gray-400">Rate</span>
              </div>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <div className="text-sm text-gray-400">Completion</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#252525] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-[#8B5CF6]" />
                <span className="text-xs text-gray-400">Time</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.floor(stats.totalTimeSpent / 60)}m
              </div>
              <div className="text-sm text-gray-400">Total Learning</div>
            </motion.div>
          </div>
        )}

        {/* Achievements Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Your Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-[#252525] rounded-lg p-4 relative overflow-hidden ${
                  achievement.unlocked ? 'ring-2 ring-[#00FFFF]/50' : 'opacity-60'
                }`}
              >
                {achievement.unlocked && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#00FFFF]/20 to-transparent" />
                )}
                <div className="relative z-10">
                  <achievement.icon className={`w-8 h-8 mb-2 ${
                    achievement.unlocked ? 'text-[#00FFFF]' : 'text-gray-500'
                  }`} />
                  <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                  <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {achievement.progress}/{achievement.target}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Filter by category:</span>
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-[#00FFFF] text-black'
                    : 'bg-[#252525] text-gray-300 hover:bg-[#2A2A2A]'
                }`}
              >
                {category === 'all' ? 'All' : 
                  category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                }
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">
            Recommended for You
            <span className="text-sm text-gray-400 ml-2">
              ({filteredRecommendations.length} models)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredRecommendations.map((rec, index) => (
                <motion.div
                  key={rec.model_slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/mental-models/${rec.model_slug}`)}
                  className="bg-[#252525] rounded-lg p-5 cursor-pointer hover:bg-[#2A2A2A] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-[#00FFFF] transition-colors">
                        {rec.model_name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {rec.category.split('-').map(w => 
                          w.charAt(0).toUpperCase() + w.slice(1)
                        ).join(' ')}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#00FFFF] transition-colors" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.type === 'continue' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                      rec.type === 'trending' ? 'bg-[#FFB84D]/20 text-[#FFB84D]' :
                      rec.type === 'new' ? 'bg-[#10B981]/20 text-[#10B981]' :
                      'bg-[#00FFFF]/20 text-[#00FFFF]'
                    }`}>
                      {rec.reason}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Continue Learning Section */}
        {stats && stats.recentModels.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Continue Learning</h2>
            <div className="bg-[#252525] rounded-lg p-6">
              <div className="space-y-3">
                {stats.recentModels.slice(0, 3).map((model, index) => (
                  <motion.div
                    key={model.slug}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/mental-models/${model.slug}`)}
                    className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium group-hover:text-[#00FFFF] transition-colors">
                          {model.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Viewed {new Date(model.viewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#00FFFF] transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Learning Insights */}
        {stats && stats.topCategories.length > 0 && (
          <div className="bg-[#252525] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">Your Learning Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Category Distribution</h3>
                <div className="space-y-2">
                  {stats.topCategories.map((cat, index) => (
                    <div key={cat.category} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">
                            {cat.category.split('-').map(w => 
                              w.charAt(0).toUpperCase() + w.slice(1)
                            ).join(' ')}
                          </span>
                          <span className="text-gray-400">{cat.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percentage}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] h-2 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Learning Patterns</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Most Active Time</span>
                    <span className="text-sm text-[#00FFFF]">
                      {new Date(stats.lastActivityDate).getHours() >= 12 ? 'Afternoon' : 'Morning'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Favorite Category</span>
                    <span className="text-sm text-[#00FFFF]">
                      {stats.favoriteCategory.split('-').map(w => 
                        w.charAt(0).toUpperCase() + w.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Avg. Session Time</span>
                    <span className="text-sm text-[#00FFFF]">
                      {Math.round(stats.totalTimeSpent / stats.totalModelsViewed)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedDashboard;