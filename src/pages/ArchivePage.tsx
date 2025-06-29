// src/pages/ArchivePage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Archive, Crown, Search, Filter, Grid, List, Calendar,
  ChevronLeft, ChevronRight, Clock, Star, TrendingUp,
  AlertCircle, Loader, RefreshCw, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserTier } from '../components/Dashboard/types';
import { supabase } from '../lib/supabase';
import BackgroundAnimation from '../components/BackgroundAnimation';

interface ArchiveQuestion {
  id: string;
  question: string;
  topic_source: string;
  category: string;
  created_at: string;
  updated_at: string;
  click_count: number;
  quality_score: number;
  display_metadata: {
    hasAnalysis: boolean;
    analysisQuality: 'premium' | 'basic';
    complexity: number;
    themes: string[];
    isHot: boolean;
    engagement: number;
    score: number;
  };
}

interface ArchiveStats {
  totalQuestions: number;
  totalBatches: number;
  categoryBreakdown: Record<string, number>;
  monthlyBreakdown: Record<string, number>;
  qualityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  averageQuality: string;
}

const ArchivePage: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  
  // User tier state
  const [userTier, setUserTier] = useState<UserTier>('free');
  
  // Archive data state
  const [questions, setQuestions] = useState<ArchiveQuestion[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'quality'>('recent');

  // Set page title
  useEffect(() => {
    document.title = 'Archive | Mind Lattice';
  }, []);

  // Check user tier
  useEffect(() => {
    if (user?.user_metadata?.tier) {
      setUserTier(user.user_metadata.tier as UserTier);
    }
  }, [user]);

  // Load archive data
  useEffect(() => {
    if (session?.access_token) {
      checkAccess();
    }
  }, [session?.access_token]);

  // Load questions when page/filters change
  useEffect(() => {
    if (userTier === 'premium' && session?.access_token) {
      fetchQuestions();
    }
  }, [currentPage, selectedCategory, sortBy, userTier, session?.access_token]);

  // Load stats once for premium users
  useEffect(() => {
    if (userTier === 'premium' && session?.access_token && !stats) {
      fetchStats();
    }
  }, [userTier, session?.access_token, stats]);

  const checkAccess = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trending-archive?action=check-access`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check access');
      }

      if (!data.isPremium) {
        setUserTier('free');
        setError('Premium subscription required to access the archive');
      } else {
        setUserTier('premium');
        setError(null);
      }
    } catch (err: any) {
      console.error('Access check error:', err);
      setError(err.message || 'Failed to verify access');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: 'list',
        page: currentPage.toString(),
        limit: '12',
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trending-archive?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch archive');
      }

      setQuestions(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      console.error('Fetch questions error:', err);
      setError(err.message || 'Failed to load archive questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trending-archive?action=stats`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.stats);
    } catch (err: any) {
      console.error('Fetch stats error:', err);
      // Don't set error for stats failure, just log it
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      business: '#10B981',
      technology: '#8B5CF6',
      personal: '#F59E0B',
      society: '#3B82F6',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  const getQualityBadge = (qualityScore: number, metadata: any) => {
    if (qualityScore >= 0.8 || metadata.analysisQuality === 'premium') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#8B5CF6]/20 to-[#8B5CF6]/10 rounded-full border border-[#8B5CF6]/30">
          <Crown className="w-3 h-3 text-[#8B5CF6]" />
          <span className="text-xs text-[#8B5CF6] font-medium">Premium</span>
        </div>
      );
    } else if (qualityScore >= 0.6) {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full border border-amber-500/30">
          <Star className="w-3 h-3 text-amber-500" />
          <span className="text-xs text-amber-400 font-medium">High</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 rounded-full border border-gray-500/30">
        <span className="text-xs text-gray-400 font-medium">Standard</span>
      </div>
    );
  };

  const filteredQuestions = questions.filter(q => 
    !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userTier === 'free') {
    return (
      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        
        <div className="relative z-10 min-h-screen">
          <div className="pt-20 pb-8 px-4">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <Link 
                  to="/dashboard"
                  className="p-2 hover:bg-[#333333]/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white">Trending Archive</h1>
                  <p className="text-gray-400 mt-1">Access historical trending questions and their insights</p>
                </div>
              </motion.div>

              {/* Premium Required Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 rounded-2xl p-8 border border-[#8B5CF6]/30"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B5CF6]/20 rounded-2xl mb-6">
                    <Archive className="w-8 h-8 text-[#8B5CF6]" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Unlock Premium Archive Access
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Access our growing collection of analyzed trending questions with full premium insights. 
                    Every question archived includes <span className="text-[#8B5CF6] font-semibold">3-4 mental models and 2-3 cognitive biases</span>.
                  </p>
                  
                  {/* Preview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-[#1A1A1A]/50 rounded-lg border border-[#333333]/50">
                      <TrendingUp className="w-6 h-6 text-[#00FFFF] mb-2 mx-auto" />
                      <div className="text-lg font-bold text-white">Growing</div>
                      <p className="text-xs text-gray-400">Archive Collection</p>
                    </div>
                    <div className="p-4 bg-[#1A1A1A]/50 rounded-lg border border-[#333333]/50">
                      <Crown className="w-6 h-6 text-[#8B5CF6] mb-2 mx-auto" />
                      <div className="text-lg font-bold text-white">3-4</div>
                      <p className="text-xs text-gray-400">Mental Models Each</p>
                    </div>
                    <div className="p-4 bg-[#1A1A1A]/50 rounded-lg border border-[#333333]/50">
                      <Search className="w-6 h-6 text-amber-500 mb-2 mx-auto" />
                      <div className="text-lg font-bold text-white">Full</div>
                      <p className="text-xs text-gray-400">Search & Filter</p>
                    </div>
                  </div>

                  {/* Sample Questions Preview */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Archived Questions</h3>
                    <div className="space-y-3">
                      {[
                        { 
                          category: 'technology', 
                          question: 'Why do AI companies keep making the same mistakes with model releases?',
                          source: 'r/MachineLearning'
                        },
                        { 
                          category: 'business', 
                          question: 'What drives people to defend obviously failing business strategies?',
                          source: 'Hacker News'
                        },
                        { 
                          category: 'personal', 
                          question: 'Why do we procrastinate on decisions we know are important?',
                          source: 'r/productivity'
                        }
                      ].map((sample, index) => (
                        <div key={index} className="p-3 bg-[#1A1A1A]/30 rounded-lg border border-[#333333]/30 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full capitalize">
                              {sample.category}
                            </span>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#333333]/50 rounded-full">
                              <Crown className="w-3 h-3 text-[#8B5CF6]" />
                              <span className="text-xs text-[#8B5CF6]">Premium</span>
                            </div>
                            <span className="text-xs text-gray-500">{sample.source}</span>
                          </div>
                          <p className="text-sm text-gray-300">{sample.question}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Each with 3-4 mental models, 2-3 cognitive biases, and full analysis</p>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-lg text-white font-medium hover:from-[#7C3AED] hover:to-[#8B5CF6] transition-all"
                  >
                    Upgrade to Premium
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Archive grows with every trending cycle
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative z-10 min-h-screen">
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
            >
              <div className="flex items-center gap-4">
                <Link 
                  to="/dashboard"
                  className="p-2 hover:bg-[#333333]/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                    <Archive className="w-7 h-7 text-[#8B5CF6]" />
                    Trending Archive
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#8B5CF6]/20 rounded-full border border-[#8B5CF6]/30">
                      <Crown className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-sm text-[#8B5CF6] font-medium">Premium</span>
                    </div>
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {stats ? `${stats.totalQuestions} archived questions from ${stats.totalBatches} trending cycles` : 'Loading archive...'}
                  </p>
                </div>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#252525]/50 rounded-lg border border-[#333333]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-l-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-[#00FFFF]/20 text-[#00FFFF]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-r-lg transition-colors ${
                      viewMode === 'list' ? 'bg-[#00FFFF]/20 text-[#00FFFF]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={fetchQuestions}
                  disabled={loading}
                  className="p-2 bg-[#252525]/50 hover:bg-[#252525]/80 border border-[#333333] rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </motion.div>

            {/* Stats Overview */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-[#252525]/50 rounded-lg p-4 border border-[#333333]/50">
                  <div className="text-2xl font-bold text-white">{stats.totalQuestions}</div>
                  <div className="text-sm text-gray-400">Total Questions</div>
                </div>
                <div className="bg-[#252525]/50 rounded-lg p-4 border border-[#333333]/50">
                  <div className="text-2xl font-bold text-[#00FFFF]">{stats.totalBatches}</div>
                  <div className="text-sm text-gray-400">Trending Cycles</div>
                </div>
                <div className="bg-[#252525]/50 rounded-lg p-4 border border-[#333333]/50">
                  <div className="text-2xl font-bold text-[#8B5CF6]">{stats.qualityDistribution.high}</div>
                  <div className="text-sm text-gray-400">Premium Quality</div>
                </div>
                <div className="bg-[#252525]/50 rounded-lg p-4 border border-[#333333]/50">
                  <div className="text-2xl font-bold text-amber-500">{stats.averageQuality}</div>
                  <div className="text-sm text-gray-400">Avg Quality</div>
                </div>
              </motion.div>
            )}

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#252525]/50 rounded-lg p-4 border border-[#333333]/50 mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search archive questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1A1A1A]/50 text-white pl-10 pr-4 py-2 rounded-lg border border-[#333333] focus:border-[#00FFFF]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#1A1A1A]/50 text-white px-4 py-2 rounded-lg border border-[#333333] focus:border-[#00FFFF]/50 focus:outline-none transition-colors"
                >
                  <option value="">All Categories</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="personal">Personal</option>
                  <option value="society">Society</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#1A1A1A]/50 text-white px-4 py-2 rounded-lg border border-[#333333] focus:border-[#00FFFF]/50 focus:outline-none transition-colors"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="quality">Highest Quality</option>
                </select>
              </div>
            </motion.div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Loader className="w-8 h-8 text-[#00FFFF] animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading archive...</p>
              </motion.div>
            )}

            {/* Questions Grid/List */}
            {!loading && !error && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.3 }}
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                    : "space-y-4 mb-8"
                  }
                >
                  {filteredQuestions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group cursor-pointer ${
                        viewMode === 'grid' 
                          ? "bg-[#252525]/50 hover:bg-[#252525]/80 rounded-lg p-6 border border-[#333333]/50 hover:border-[#00FFFF]/30"
                          : "bg-[#252525]/50 hover:bg-[#252525]/80 rounded-lg p-4 border border-[#333333]/50 hover:border-[#00FFFF]/30 flex items-center gap-4"
                      } transition-all duration-200`}
                      onClick={() => handleQuestionClick(question)}
                    >
                      {/* Category Badge */}
                      <div className={`flex items-center ${viewMode === 'list' ? 'flex-shrink-0' : 'justify-between'} gap-2 mb-3`}>
                        <span 
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ 
                            backgroundColor: `${getCategoryColor(question.category)}20`,
                            color: getCategoryColor(question.category),
                            border: `1px solid ${getCategoryColor(question.category)}30`
                          }}
                        >
                          {question.category}
                        </span>
                        {viewMode === 'grid' && getQualityBadge(question.quality_score, question.display_metadata)}
                      </div>

                      {/* Question Content */}
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h3 className={`font-semibold text-gray-200 group-hover:text-white transition-colors ${
                          viewMode === 'grid' ? 'text-base mb-3 line-clamp-3' : 'text-sm mb-2 line-clamp-2'
                        }`}>
                          {question.question}
                        </h3>

                        {/* Metadata */}
                        <div className={`flex items-center gap-4 text-xs text-gray-500 ${
                          viewMode === 'list' ? 'flex-wrap' : ''
                        }`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(question.updated_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {question.click_count} views
                          </span>
                          {question.display_metadata.engagement > 0 && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {question.display_metadata.engagement} engagement
                            </span>
                          )}
                        </div>

                        {/* Source */}
                        <p className="text-xs text-gray-600 mt-2 truncate">
                          Source: {question.topic_source}
                        </p>
                      </div>

                      {/* List view quality badge */}
                      {viewMode === 'list' && (
                        <div className="flex-shrink-0">
                          {getQualityBadge(question.quality_score, question.display_metadata)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between"
              >
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-[#252525]/50 hover:bg-[#252525]/80 border border-[#333333] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-[#252525]/50 hover:bg-[#252525]/80 border border-[#333333] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredQuestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Archive className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No questions found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory 
                    ? 'Try adjusting your search or filters' 
                    : 'The archive is empty'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivePage; 