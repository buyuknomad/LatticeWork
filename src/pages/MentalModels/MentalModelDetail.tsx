// src/pages/MentalModels/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Book, Brain, Lightbulb, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MentalModelSummary, 
  MentalModelFilters, 
  MENTAL_MODEL_CATEGORIES,
  CATEGORY_METADATA,
  getCategoryMetadata,
  getCategoryColor
} from '../../types/mentalModels';
import SEO from '../../components/SEO';
import CategoryBadge from '../../components/CategoryBadge';
import { getMentalModels, getMentalModelsCount } from '../../lib/mentalModelsService';
import { formatCategoryName, debounce } from '../../lib/mentalModelsUtils';

const MentalModels: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<MentalModelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0); // Total count for current filters
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState(''); // For immediate UI updates
  const [filters, setFilters] = useState<MentalModelFilters>({
    searchQuery: '',
    selectedCategory: null,
    page: 1
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({ ...prev, searchQuery: query, page: 1 }));
    }, 300),
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

  // Handle search input change with debouncing
  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMentalModels(filters, 20);
      setModels(response.data);
      setFilteredCount(response.count); // Set the total filtered count
      setTotalPages(response.totalPages);
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

  const handleSearchInputChange = (query: string) => {
    setSearchInput(query);
  };

  const handleCategoryChange = (category: string | null) => {
    setFilters(prev => ({ ...prev, selectedCategory: category, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ searchQuery: '', selectedCategory: null, page: 1 });
  };

  const handleModelClick = (slug: string) => {
    navigate(`/mental-models/${slug}`);
  };

  const filteredModels = models; // Current page of models (already filtered by database)

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
        {/* Header Section - Fixed padding to account for fixed header */}
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#252525] pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* New: Link to Guide */}
              <div className="mb-6">
                <Link 
                  to="/mental-models-guide"
                  className="inline-flex items-center px-4 py-2 bg-[#252525] border border-[#333333] rounded-lg text-gray-300 hover:text-[#00FFFF] hover:border-[#00FFFF]/30 transition-all duration-300 text-sm"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  New to mental models? Start with our guide
                </Link>
              </div>

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

        {/* Search and Filter Section - Fixed positioning to account for header */}
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
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] focus:border-transparent transition-colors"
                  />
                  {/* Loading indicator for search */}
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
                        onClick={() => handleModelClick(model.slug)}
                      >
                        {/* Category Badge */}
                        <div className="mb-4">
                          <CategoryBadge 
                            category={model.category} 
                            size="sm"
                          />
                        </div>

                        {/* Model Name */}
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-[#00FFFF] transition-colors">
                          {model.name}
                        </h3>

                        {/* Core Concept */}
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          {model.core_concept}
                        </p>

                        {/* Read More */}
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
                  
                  {/* Page numbers */}
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