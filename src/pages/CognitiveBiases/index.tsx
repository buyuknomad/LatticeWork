// src/pages/CognitiveBiases/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Filter,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BackgroundAnimation from '../../components/BackgroundAnimation';
import SEO from '../../components/SEO';
import { 
  getCognitiveBiases, 
  getCognitiveBiasStats 
} from '../../lib/cognitiveBiasesService';
import { 
  CognitiveBiasSummary, 
  CognitiveBiasFilters,
  CognitiveBiasStats,
  COGNITIVE_BIAS_CATEGORIES,
  CATEGORY_METADATA,
  getCategoryMetadata
} from '../../types/cognitiveBiases';
import { 
  debounce, 
  truncateText,
  formatCbId,
  formatProgressStats
} from '../../lib/cognitiveBiasesUtils';

const CognitiveBiases: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [biases, setBiases] = useState<CognitiveBiasSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CognitiveBiasStats | null>(null);
  const [filters, setFilters] = useState<CognitiveBiasFilters>({
    searchQuery: searchParams.get('search') || '',
    selectedCategory: searchParams.get('category') || null,
    page: parseInt(searchParams.get('page') || '1', 10)
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch biases
  const fetchBiases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCognitiveBiases(filters, 20);
      setBiases(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error fetching biases:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const data = await getCognitiveBiasStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Effects
  useEffect(() => {
    fetchBiases();
  }, [fetchBiases]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.selectedCategory) params.set('category', filters.selectedCategory);
    if (filters.page > 1) params.set('page', filters.page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({ ...prev, searchQuery: query, page: 1 }));
    }, 300),
    []
  );

  // Handlers
  const handleCategorySelect = (category: string | null) => {
    setFilters(prev => ({ 
      ...prev, 
      selectedCategory: category === prev.selectedCategory ? null : category,
      page: 1 
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategory: null,
      page: 1
    });
  };

  const progressInfo = stats ? formatProgressStats(stats.unique_biases, stats.total_biases) : null;

  return (
    <>
      <SEO
        title="Cognitive Biases Library - 227 Thinking Errors Explained | Mind Lattice"
        description="Explore our comprehensive library of 227 cognitive biases. Learn to recognize and overcome thinking errors that affect your decisions."
        keywords="cognitive biases, thinking errors, decision making, psychology, behavioral economics"
        url="/cognitive-biases"
      />

      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        
        <div className="relative z-10 pt-24 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back Link */}
            <Link to="/" className="inline-flex items-center text-[#00FFFF] hover:underline mb-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#252525] rounded-xl">
                  <Brain className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Cognitive Biases Library</h1>
                  <p className="text-gray-400">Master your mind by understanding its biases</p>
                </div>
              </div>

              {/* Progress Stats */}
              {progressInfo && (
                <div className="bg-[#252525]/50 backdrop-blur-sm rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${progressInfo.color}`}>
                      {progressInfo.text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {progressInfo.percentage}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressInfo.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 space-y-4"
            >
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search biases by name or concept..."
                  defaultValue={filters.searchQuery}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, searchQuery: '', page: 1 }));
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-400 text-sm flex items-center mr-2">
                  <Filter className="h-4 w-4 mr-1" />
                  Categories:
                </span>
                {COGNITIVE_BIAS_CATEGORIES.map(category => {
                  const meta = getCategoryMetadata(category);
                  const isSelected = filters.selectedCategory === category;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isSelected 
                          ? 'bg-amber-400 text-[#1A1A1A]' 
                          : 'bg-[#252525] text-gray-300 hover:bg-[#333333]'
                      }`}
                    >
                      <span className="mr-1">{meta.icon}</span>
                      {meta.name}
                    </button>
                  );
                })}
                
                {(filters.selectedCategory || filters.searchQuery) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Results Count */}
              {!loading && (
                <div className="text-sm text-gray-400">
                  Showing {biases.length} of {totalCount} biases
                  {filters.searchQuery && ` matching "${filters.searchQuery}"`}
                  {filters.selectedCategory && ` in ${getCategoryMetadata(filters.selectedCategory as any).name}`}
                </div>
              )}
            </motion.div>

            {/* Biases Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-[#252525]/50 rounded-xl p-6 animate-pulse">
                      <div className="h-6 bg-[#333333] rounded mb-3" />
                      <div className="h-4 bg-[#333333] rounded mb-2" />
                      <div className="h-20 bg-[#333333] rounded" />
                    </div>
                  ))}
                </motion.div>
              ) : biases.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#252525]/50 backdrop-blur-sm rounded-xl p-12 text-center"
                >
                  <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No biases found</h3>
                  <p className="text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="biases"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {biases.map((bias, index) => {
                    const categoryMeta = getCategoryMetadata(bias.category as any);
                    
                    return (
                      <motion.div
                        key={bias.cb_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => navigate(`/cognitive-biases/${bias.slug}`)}
                        className="bg-[#252525]/50 backdrop-blur-sm rounded-xl p-6 border border-[#333333] hover:border-amber-400/50 cursor-pointer group transition-all hover:transform hover:scale-[1.02]"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-amber-400 font-mono">
                                {formatCbId(bias.cb_id)}
                              </span>
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ 
                                  backgroundColor: `${categoryMeta.color}20`,
                                  color: categoryMeta.color 
                                }}
                              >
                                {categoryMeta.icon} {categoryMeta.name}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {bias.name}
                            </h3>
                          </div>
                        </div>

                        {/* Core Concept */}
                        <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                          {truncateText(bias.core_concept, 150)}
                        </p>

                        {/* Read More */}
                        <div className="flex items-center text-amber-400 text-sm font-medium group-hover:gap-2 transition-all">
                          <span>Learn More</span>
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-12 flex items-center justify-center gap-2"
              >
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-2 rounded-lg bg-[#252525] border border-[#333333] text-gray-400 hover:text-white hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          pageNum === filters.page
                            ? 'bg-amber-400 text-[#1A1A1A]'
                            : 'bg-[#252525] text-gray-400 hover:text-white hover:border-amber-400 border border-[#333333]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="p-2 rounded-lg bg-[#252525] border border-[#333333] text-gray-400 hover:text-white hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </motion.div>
            )}

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl p-8 border border-amber-400/30">
                <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-3">
                  Ready to Overcome Your Biases?
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Understanding cognitive biases is the first step to better decision-making. 
                  Take our personalized assessment to discover which biases affect you most.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-amber-400 text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-amber-400/90 transition-colors"
                >
                  Start Your Assessment
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CognitiveBiases;