// src/pages/MentalModels/index.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Book, Brain, Lightbulb, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash'; // Make sure to install lodash if not already installed
import { 
  MentalModelSummary, 
  MentalModelFilters, 
  MENTAL_MODEL_CATEGORIES,
  CATEGORY_METADATA,
  getCategoryMetadata,
  getCategoryColor,
  isValidCategory
} from '../../types/mentalModels';
import SEO from '../../components/SEO';
import CategoryBadge from '../../components/CategoryBadge';
import { getMentalModels, getMentalModelsCount } from '../../lib/mentalModelsService';
import { formatCategoryName } from '../../lib/mentalModelsUtils';
import { analytics } from '../../services/analytics';
import { GA_EVENTS, GA_CATEGORIES } from '../../constants/analytics';

// ADD THESE IMPORTS
import { useSearchTracking } from '../../hooks/useModelTracking';

const MentalModels: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [models, setModels] = useState<MentalModelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<MentalModelFilters>({
    searchQuery: '',
    selectedCategory: null,
    page: 1
  });
  const [searchResults, setSearchResults] = useState<MentalModelSummary[]>([]);

  // ADD SEARCH TRACKING
  const { trackSearch, trackSearchClick } = useSearchTracking();

  // Initialize filters from URL parameters on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');
    
    let hasChanges = false;
    let newFilters = { ...filters };
    
    if (categoryParam && isValidCategory(categoryParam)) {
      newFilters.selectedCategory = categoryParam;
      hasChanges = true;
    }
    
    if (searchParam) {
      newFilters.searchQuery = searchParam;
      setSearchInput(searchParam);
      hasChanges = true;
    }
    
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        newFilters.page = pageNum;
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      setFilters(newFilters);
    }
  }, []);

  // Track page view
  useEffect(() => {
    analytics.trackEvent(
      GA_CATEGORIES.MENTAL_MODELS,
      GA_EVENTS.MENTAL_MODELS.VIEW_LIBRARY,
      'library_page_load'
    );
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.selectedCategory) {
      params.set('category', filters.selectedCategory);
    }
    
    if (filters.searchQuery) {
      params.set('search', filters.searchQuery);
    }
    
    if (filters.page > 1) {
      params.set('page', filters.page.toString());
    }
    
    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  // TRACK SEARCH WITH DEBOUNCE
  const handleSearch = useMemo(
    () => debounce((query: string) => {
      // Perform the search
      setFilters(prev => ({ ...prev, searchQuery: query, page: 1 }));
      
      // Track the search after results are loaded
      // This will be called after fetchModels completes
    }, 500),
    []
  );

  // Create debounced search tracker for Google Analytics
  const trackGoogleSearch = useCallback(
    analytics.createDebouncedTracker(
      GA_CATEGORIES.MENTAL_MODELS,
      GA_EVENTS.MENTAL_MODELS.SEARCH,
      1000
    ),
    []
  );

  // Fetch data when filters change
  useEffect(() => {
    fetchModels();
  }, [filters]);

  // Fetch total count on mount
  useEffect(() => {
    fetchTotalCount();
  }, []);

  // UPDATE SEARCH INPUT HANDLER
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchInput(query);
    handleSearch(query);
    
    // Track search for Google Analytics (debounced)
    if (query) {
      trackGoogleSearch(query);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMentalModels(filters, 20);
      setModels(response.data);
      setSearchResults(response.data); // Store for search tracking
      setFilteredCount(response.count);
      setTotalPages(response.totalPages);
      
      // Track the search if there's a query
      if (filters.searchQuery) {
        trackSearch(filters.searchQuery, response.data, { 
          category: filters.selectedCategory 
        });
      }
    } catch (err) {
      console.error('Error fetching mental models:', err);
      setError('Failed to load mental models. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const count = await getMentalModelsCount();
      setTotalCount(count);
    } catch (err) {
      console.error('Error fetching total count:', err);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setFilters(prev => ({ ...prev, selectedCategory: category, page: 1 }));
    
    // Track category filter for both analytics systems
    analytics.trackEvent(
      GA_CATEGORIES.MENTAL_MODELS,
      GA_EVENTS.MENTAL_MODELS.FILTER_CATEGORY,
      category || 'all_categories'
    );
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    
    // Track pagination
    analytics.trackEvent(
      GA_CATEGORIES.ENGAGEMENT,
      'pagination_click',
      `page_${page}`
    );
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ searchQuery: '', selectedCategory: null, page: 1 });
    setSearchResults([]);
  };

  // TRACK MODEL CLICKS
  const handleModelClick = (model: MentalModelSummary, index: number) => {
    // Track if this was from search results
    if (filters.searchQuery) {
      trackSearchClick(model.slug, index + 1);
    }
    
    // Track for Google Analytics
    analytics.trackEvent(
      GA_CATEGORIES.MENTAL_MODELS,
      GA_EVENTS.MENTAL_MODELS.VIEW_MODEL,
      model.slug
    );
    
    // Navigate with appropriate tracking source
    const source = filters.searchQuery ? 'library_search' : 'library_browse';
    navigate(`/mental-models/${model.slug}?source=${source}`, {
      state: { from: filters.searchQuery ? 'search' : 'browse' }
    });
  };

  const filteredModels = models;

  return (
    <>
      <SEO
        title={`${totalCount}+ Mental Models Library - Complete Collection | Mind Lattice`}
        description={`Explore ${totalCount}+ mental models for better thinking and decision making. Each model includes real-world examples, practical applications, and actionable insights.`}
        keywords="mental models, thinking frameworks, decision making, cognitive tools, first principles, systems thinking, Charlie Munger"
        url="/mental-models"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Mental Models Library",
          "description": "Complete collection of mental models for better thinking and decision making",
          "numberOfItems": totalCount,
          "publisher": {
            "@type": "Organization",
            "name": "Mind Lattice"
          }
        }}
      />
      
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#252525] pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Guide Link */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link 
                  to="/mental-models-guide"
                  onClick={() => {
                    analytics.trackEvent(
                      GA_CATEGORIES.MENTAL_MODELS,
                      GA_EVENTS.MENTAL_MODELS.CLICK_GUIDE,
                      'header_guide_link'
                    );
                  }}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/20 to-[#00FFFF]/20 group-hover:from-[#8B5CF6]/30 group-hover:to-[#00FFFF]/30 transition-all duration-300" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-[#8B5CF6] to-[#00FFFF] opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-[#00FFFF]/10 blur-xl group-hover:blur-2xl transition-all duration-300" />
                  
                  <div className="relative flex items-center gap-3">
                    <motion.div
                      className="p-2 bg-white/10 rounded-lg"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <HelpCircle className="w-6 h-6 text-[#00FFFF]" />
                    </motion.div>
                    
                    <div className="text-left">
                      <div className="text-xs text-[#8B5CF6] font-semibold uppercase tracking-wider mb-1">
                        New Here?
                      </div>
                      <div className="text-lg font-bold text-white group-hover:text-[#00FFFF] transition-colors">
                        Start with our Mental Models Guide
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">
                        Learn the fundamentals in 10 minutes
                      </div>
                    </div>
                    
                    <svg className="w-5 h-5 text-[#00FFFF] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
              </motion.div>

              <div className="flex items-center justify-center mb-6">
                <Brain className="w-12 h-12 text-[#00FFFF] mr-4" />
                <h1 className="text-4xl md:text-6xl font-bold font-heading">
                  Mental Models
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] ml-4">
                    Library
                  </span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Explore {totalCount > 0 ? `${totalCount}+` : '298+'} mental models that help you think better, make smarter decisions, and understand complex situations. 
                Each model includes real-world examples, practical applications, and actionable insights.
              </p>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Book className="w-5 h-5 mr-2 text-[#00FFFF]" />
                  <span>{totalCount > 0 ? `${totalCount}+` : '298+'} Models</span>
                </div>
                <div className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-[#FFB84D]" />
                  <span>Real Examples</span>
                </div>
                <div className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-[#8B5CF6]" />
                  <span>15 Categories</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="sticky top-16 z-40 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-[#333333] py-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search mental models..."
                    value={searchInput}
                    onChange={onSearchChange}
                    className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] focus:border-transparent transition-colors"
                  />
                  {searchInput !== filters.searchQuery && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={filters.selectedCategory || ''}
                  onChange={(e) => handleCategoryChange(e.target.value || null)}
                  className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FFFF] focus:border-transparent transition-colors"
                >
                  <option value="">All Categories</option>
                  {MENTAL_MODEL_CATEGORIES.map(category => {
                    const metadata = CATEGORY_METADATA[category];
                    return (
                      <option key={category} value={category}>
                        {metadata.icon} {metadata.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.searchQuery || filters.selectedCategory) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/30">
                    Search: "{filters.searchQuery}"
                    <button 
                      onClick={() => {
                        setSearchInput('');
                        setFilters(prev => ({ ...prev, searchQuery: '', page: 1 }));
                      }}
                      className="ml-2 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.selectedCategory && (
                  <div className="inline-flex items-center">
                    <CategoryBadge 
                      category={filters.selectedCategory} 
                      size="sm"
                    />
                    <button 
                      onClick={() => handleCategoryChange(null)}
                      className="ml-2 text-gray-400 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">Error Loading Mental Models</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={fetchModels}
                  className="mt-4 px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-[#252525] rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-600 rounded mb-3"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400">
                  {filteredCount} model{filteredCount !== 1 ? 's' : ''} found
                  {totalPages > 1 && (
                    <span className="ml-2 text-gray-500">
                      • Showing {models.length} on this page
                    </span>
                  )}
                  {filters.searchQuery || filters.selectedCategory ? (
                    <span className="ml-2">
                      • <button 
                          onClick={clearFilters}
                          className="text-[#00FFFF] hover:underline text-sm transition-colors"
                        >
                          Clear filters
                        </button>
                    </span>
                  ) : ''}
                </p>
                
                {totalPages > 1 && (
                  <div className="text-sm text-gray-400">
                    Page {filters.page} of {totalPages}
                  </div>
                )}
              </div>

              {/* Models Grid */}
              {models.length > 0 && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {filteredModels.map((model, index) => {
                    return (
                      <motion.div
                        key={model.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-[#252525] rounded-lg p-6 border border-[#333333] hover:border-[#00FFFF]/30 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleModelClick(model, index)}
                      >
                        <div className="mb-4">
                          <CategoryBadge 
                            category={model.category} 
                            size="sm"
                          />
                        </div>

                        <h3 className="text-xl font-semibold mb-3 group-hover:text-[#00FFFF] transition-colors">
                          {model.name}
                        </h3>

                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          {model.core_concept}
                        </p>

                        <div className="flex items-center text-[#00FFFF] text-sm font-medium group-hover:text-white transition-colors">
                          Read More
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-3 py-2 text-sm bg-[#252525] text-white rounded-lg border border-[#333333] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          pageNum === filters.page
                            ? 'bg-[#00FFFF] text-black border-[#00FFFF]'
                            : 'bg-[#252525] text-white border-[#333333] hover:bg-[#333333]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages}
                    className="px-3 py-2 text-sm bg-[#252525] text-white rounded-lg border border-[#333333] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* No Results */}
              {filteredCount === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">No mental models found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MentalModels;