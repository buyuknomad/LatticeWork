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
  Zap,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RecommendationWidget from './RecommendationWidget';
import LearningPath from './LearningPath';

interface PersonalizedStats {
  totalModelsViewed: number;
  favoriteCategory: string;
  learningStreak: number;
  completionRate: number;
  totalTimeSpent: number;
  lastActivityDate: string | null;
  topCategories: { category: string; count: number; percentage: number }[];
  recentModels: { slug: string; name: string; category: string; viewedAt: string }[];
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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch user stats
  const fetchUserStats = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Try to use the database function first
      try {
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_user_learning_stats', { p_user_id: user.id });

        if (!statsError && statsData && statsData.length > 0) {
          const stat = statsData[0];
          
          // Get additional details for the dashboard
          const { data: views } = await supabase
            .from('mental_model_views')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

          if (views && views.length > 0) {
            // Calculate category distribution
            const categoryCount: Record<string, number> = {};
            views.forEach(v => {
              if (v.category) {
                categoryCount[v.category] = (categoryCount[v.category] || 0) + 1;
              }
            });

            const topCategories = Object.entries(categoryCount)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => ({
                category,
                count,
                percentage: Math.round((count / views.length) * 100)
              }));

            // Get recent models - map model_slug to the actual model data
            const recentModels = await Promise.all(
              views.slice(0, 5).map(async (view) => {
                const { data: model } = await supabase
                  .from('mental_models_library')  // FIXED: correct table name
                  .select('name, slug')  // Get both name and slug
                  .eq('slug', view.model_slug)  // FIXED: match by slug column
                  .maybeSingle();
                
                return {
                  slug: view.model_slug,  // Use the model_slug from views
                  name: model?.name || 'Unknown Model',
                  category: view.category || 'uncategorized',
                  viewedAt: view.created_at
                };
              })
            );

            setStats({
              totalModelsViewed: stat.total_models_viewed || 0,
              favoriteCategory: stat.favorite_category || 'none',
              learningStreak: stat.learning_streak_days || 0,
              completionRate: stat.completion_rate || 0,
              totalTimeSpent: stat.total_time_spent_minutes || 0,
              lastActivityDate: stat.last_activity_date,
              topCategories,
              recentModels
            });
          } else {
            // New user with no views
            setStats({
              totalModelsViewed: 0,
              favoriteCategory: 'none',
              learningStreak: 0,
              completionRate: 0,
              totalTimeSpent: 0,
              lastActivityDate: null,
              topCategories: [],
              recentModels: []
            });
          }
        }
      } catch (rpcError) {
        console.error('RPC function error, falling back to manual calculation:', rpcError);
        
        // Fallback: Manual calculation if function doesn't exist
        const { data: views, error: viewsError } = await supabase
          .from('mental_model_views')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (viewsError) throw viewsError;

        if (views && views.length > 0) {
          // Calculate stats manually
          const uniqueModels = new Set(views.map(v => v.model_slug));
          const totalModelsViewed = uniqueModels.size;

          // Calculate category distribution
          const categoryCount: Record<string, number> = {};
          views.forEach(v => {
            if (v.category) {
              categoryCount[v.category] = (categoryCount[v.category] || 0) + 1;
            }
          });

          const topCategories = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({
              category,
              count,
              percentage: Math.round((count / views.length) * 100)
            }));

          const favoriteCategory = topCategories[0]?.category || 'none';

          // Calculate learning streak (simple version - consecutive days)
          const uniqueDates = [...new Set(views.map(v => 
            new Date(v.created_at).toDateString()
          ))];
          const learningStreak = uniqueDates.length;

          // Calculate total time spent
          const totalTimeSpent = Math.round(
            views.reduce((sum, v) => sum + (v.view_duration || 0), 0) / 60
          );

          // Calculate completion rate
          const completedViews = views.filter(v => v.view_duration && v.view_duration > 30);
          const completionRate = views.length > 0 
            ? Math.round((completedViews.length / views.length) * 100)
            : 0;

          // Get recent models
          const recentModels = await Promise.all(
            views.slice(0, 5).map(async (view) => {
              const { data: model } = await supabase
                .from('mental_models_library')  // FIXED: correct table name
                .select('name, slug')
                .eq('slug', view.model_slug)  // FIXED: match by slug column
                .maybeSingle();
              
              return {
                slug: view.model_slug,
                name: model?.name || 'Unknown Model',
                category: view.category || 'uncategorized',
                viewedAt: view.created_at
              };
            })
          );

          setStats({
            totalModelsViewed,
            favoriteCategory,
            learningStreak,
            completionRate,
            totalTimeSpent,
            lastActivityDate: views[0].created_at,
            topCategories,
            recentModels
          });
        } else {
          // New user with no activity
          setStats({
            totalModelsViewed: 0,
            favoriteCategory: 'none',
            learningStreak: 0,
            completionRate: 0,
            totalTimeSpent: 0,
            lastActivityDate: null,
            topCategories: [],
            recentModels: []
          });
        }
      }

      // Calculate achievements
      if (stats) {
        calculateAchievements(stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Unable to load your learning statistics. Please try again later.');
      
      // Set default empty stats
      setStats({
        totalModelsViewed: 0,
        favoriteCategory: 'none',
        learningStreak: 0,
        completionRate: 0,
        totalTimeSpent: 0,
        lastActivityDate: null,
        topCategories: [],
        recentModels: []
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate achievements based on stats
  const calculateAchievements = (userStats: PersonalizedStats) => {
    const achievementList: Achievement[] = [
      {
        id: 'explorer',
        title: 'Explorer',
        description: 'View 10 different mental models',
        icon: Brain,
        target: 10,
        progress: userStats.totalModelsViewed,
        unlocked: userStats.totalModelsViewed >= 10
      },
      {
        id: 'dedicated',
        title: 'Dedicated Learner',
        description: 'Maintain a 7-day learning streak',
        icon: Zap,
        target: 7,
        progress: userStats.learningStreak,
        unlocked: userStats.learningStreak >= 7
      },
      {
        id: 'focused',
        title: 'Focused Mind',
        description: 'Spend 30 minutes learning',
        icon: Clock,
        target: 30,
        progress: userStats.totalTimeSpent,
        unlocked: userStats.totalTimeSpent >= 30
      },
      {
        id: 'diverse',
        title: 'Diverse Thinker',
        description: 'Explore 5 different categories',
        icon: Sparkles,
        target: 5,
        progress: userStats.topCategories.length,
        unlocked: userStats.topCategories.length >= 5
      },
      {
        id: 'thorough',
        title: 'Thorough Scholar',
        description: 'Achieve 80% completion rate',
        icon: Award,
        target: 80,
        progress: userStats.completionRate,
        unlocked: userStats.completionRate >= 80
      }
    ];

    setAchievements(achievementList);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUserStats();
    }
  }, [user?.id, authLoading]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing && user?.id) {
        fetchUserStats();
        setLastRefresh(new Date());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id, isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserStats();
    setLastRefresh(new Date());
  };

  const formatCategory = (category: string) => {
    if (!category || category === 'none') return 'Not Set';
    return category.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#00FFFF]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-[#252525] rounded-lg p-8 text-center">
            <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-400 mb-6">
              Please login to access your personalized learning dashboard
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-[#00FFFF] text-black rounded-lg font-medium hover:bg-[#00FFFF]/90 transition-colors"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isNewUser = !stats || stats.totalModelsViewed === 0;

  return (
    <div className="min-h-screen bg-[#1A1A1A] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Learning Journey
            </h1>
            <p className="text-gray-400">
              {isNewUser 
                ? 'Start exploring mental models to track your progress'
                : `Last active: ${formatDate(stats?.lastActivityDate || null)}`
              }
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 bg-[#252525] rounded-lg hover:bg-[#2A2A2A] transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-yellow-500">{error}</p>
          </div>
        )}

        {isNewUser ? (
          // New User Onboarding View
          <div className="space-y-6">
            <div className="bg-[#252525] rounded-lg p-8 text-center">
              <Brain className="w-20 h-20 text-[#00FFFF] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Your Learning Journey!
              </h2>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Start exploring mental models to unlock personalized recommendations, 
                track your progress, and earn achievements. Your journey begins with 
                the first model you explore.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/mental-models')}
                  className="px-6 py-3 bg-[#00FFFF] text-black rounded-lg font-medium hover:bg-[#00FFFF]/90 transition-colors"
                >
                  Explore Mental Models
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-[#252525] border border-[#00FFFF]/30 text-[#00FFFF] rounded-lg font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>

            {/* Show empty achievements to give user goals */}
            <div className="bg-[#252525] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Achievements to Unlock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-[#1A1A1A] rounded-lg p-4 text-center opacity-50"
                  >
                    {React.createElement(achievement.icon, {
                      className: 'w-8 h-8 text-gray-500 mx-auto mb-2'
                    })}
                    <h4 className="font-medium text-gray-400 text-sm mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {achievement.description}
                    </p>
                    <div className="mt-2">
                      <div className="bg-[#252525] rounded-full h-2 overflow-hidden">
                        <div className="bg-gray-600 h-full w-0"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        0 / {achievement.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show recommendations even for new users */}
            <RecommendationWidget
              title="Start Your Journey With These Models"
              subtitle="Popular models to begin your learning"
              variant="card"
              limit={4}
              showRefresh={false}
            />
          </div>
        ) : (
          // Experienced User View
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#252525] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-8 h-8 text-[#00FFFF]" />
                  <span className="text-2xl font-bold text-white">
                    {stats?.totalModelsViewed || 0}
                  </span>
                </div>
                <h3 className="text-sm text-gray-400">Models Explored</h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#252525] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-[#8B5CF6]" />
                  <span className="text-2xl font-bold text-white">
                    {stats?.totalTimeSpent || 0}m
                  </span>
                </div>
                <h3 className="text-sm text-gray-400">Time Invested</h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#252525] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-[#FFB84D]" />
                  <span className="text-2xl font-bold text-white">
                    {stats?.learningStreak || 0}
                  </span>
                </div>
                <h3 className="text-sm text-gray-400">Day Streak</h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#252525] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-[#10B981]" />
                  <span className="text-2xl font-bold text-white">
                    {stats?.completionRate || 0}%
                  </span>
                </div>
                <h3 className="text-sm text-gray-400">Completion Rate</h3>
              </motion.div>
            </div>

            {/* Achievements */}
            <div className="bg-[#252525] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Your Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-[#1A1A1A] rounded-lg p-4 text-center transition-all ${
                      achievement.unlocked 
                        ? 'ring-2 ring-[#00FFFF] shadow-lg shadow-[#00FFFF]/20' 
                        : 'opacity-60'
                    }`}
                  >
                    {React.createElement(achievement.icon, {
                      className: `w-8 h-8 mx-auto mb-2 ${
                        achievement.unlocked ? 'text-[#00FFFF]' : 'text-gray-500'
                      }`
                    })}
                    <h4 className={`font-medium text-sm mb-1 ${
                      achievement.unlocked ? 'text-white' : 'text-gray-400'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {achievement.description}
                    </p>
                    <div className="mt-2">
                      <div className="bg-[#252525] rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` 
                          }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`h-full ${
                            achievement.unlocked ? 'bg-[#00FFFF]' : 'bg-gray-600'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.progress} / {achievement.target}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Continue Learning Section */}
            {stats?.recentModels && stats.recentModels.length > 0 && (
              <div className="bg-[#252525] rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Continue Learning
                </h3>
                <div className="space-y-3">
                  {stats.recentModels.map((model, index) => (
                    <motion.div
                      key={model.slug}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/mental-models/${model.slug}`)}  // FIXED: using slug
                      className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-[#00FFFF]" />
                        <div>
                          <h4 className="font-medium text-white group-hover:text-[#00FFFF] transition-colors">
                            {model.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatCategory(model.category)} • {formatDate(model.viewedAt)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#00FFFF] transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <RecommendationWidget
              title="Recommended for You"
              subtitle="Based on your learning history"
              variant="card"
              limit={4}
            />

            {/* Learning Path */}
            {stats?.favoriteCategory && stats.favoriteCategory !== 'none' && (
              <LearningPath
                category={stats.favoriteCategory}
                variant="linear"
                showProgress={true}
              />
            )}

            {/* Category Insights */}
            {stats?.topCategories && stats.topCategories.length > 0 && (
              <div className="bg-[#252525] rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Your Learning Focus
                </h3>
                <div className="space-y-3">
                  {stats.topCategories.map((cat, index) => (
                    <div key={cat.category} className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-32">
                        {formatCategory(cat.category)}
                      </span>
                      <div className="flex-1 bg-[#1A1A1A] rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]"
                        />
                      </div>
                      <span className="text-sm text-white font-medium">
                        {cat.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedDashboard;