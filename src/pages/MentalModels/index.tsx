// src/pages/MentalModels/index.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Book, Brain, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { MentalModelSummary, MentalModelFilters, MENTAL_MODEL_CATEGORIES } from '../../types/mentalModels';
import SEO from '../../components/SEO';

const MentalModels: React.FC = () => {
  const [models, setModels] = useState<MentalModelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MentalModelFilters>({
    searchQuery: '',
    selectedCategory: null,
    page: 1
  });

  // Mock data for now - will replace with real data in Step 2
  const mockModels: MentalModelSummary[] = [
    {
      name: "First Principles Thinking",
      slug: "first-principles-thinking",
      category: "fundamental-concepts",
      core_concept: "Break down complex problems into their most basic, foundational elements to build understanding from the ground up.",
      order_index: 1
    },
    {
      name: "Second-Order Thinking",
      slug: "second-order-thinking", 
      category: "fundamental-concepts",
      core_concept: "Consider not just the immediate effects of a decision, but the consequences of those consequences.",
      order_index: 2
    },
    {
      name: "Inversion",
      slug: "inversion",
      category: "fundamental-concepts", 
      core_concept: "Approach problems backwards by considering what you want to avoid rather than what you want to achieve.",
      order_index: 3
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setModels(mockModels);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query, page: 1 }));
  };

  const handleCategoryChange = (category: string | null) => {
    setFilters(prev => ({ ...prev, selectedCategory: category, page: 1 }));
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = !filters.searchQuery || 
      model.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      model.core_concept.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const matchesCategory = !filters.selectedCategory || 
      model.category === filters.selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEO
        title="300+ Mental Models Library - Complete Collection | Mind Lattice"
        description="Explore 298+ mental models for better thinking and decision making. Each model includes real-world examples, practical applications, and actionable insights."
        keywords="mental models, thinking frameworks, decision making, cognitive tools, first principles, systems thinking, Charlie Munger"
        url="/mental-models"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Mental Models Library",
          "description": "Complete collection of mental models for better thinking and decision making",
          "numberOfItems": 298,
          "publisher": {
            "@type": "Organization",
            "name": "Mind Lattice"
          }
        }}
      />
      
      <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-[#1A1A1A] to-[#252525] py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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
              Explore 298+ mental models that help you think better, make smarter decisions, and understand complex situations. 
              Each model includes real-world examples, practical applications, and actionable insights.
            </p>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Book className="w-5 h-5 mr-2 text-[#00FFFF]" />
                <span>298+ Models</span>
              </div>
              <div className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-[#FFB84D]" />
                <span>Real Examples</span>
              </div>
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#8B5CF6]" />
                <span>16 Categories</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="sticky top-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-[#333333] py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mental models..."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={filters.selectedCategory || ''}
                onChange={(e) => handleCategoryChange(e.target.value || null)}
                className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FFFF] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {MENTAL_MODEL_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
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
                    onClick={() => handleSearchChange('')}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.selectedCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  Category: {filters.selectedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <button 
                    onClick={() => handleCategoryChange(null)}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
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
                {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Models Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredModels.map((model, index) => (
                <motion.div
                  key={model.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-[#252525] rounded-lg p-6 border border-[#333333] hover:border-[#00FFFF]/30 transition-all duration-300 cursor-pointer group"
                  onClick={() => window.location.href = `/mental-models/${model.slug}`}
                >
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                      {model.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
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
              ))}
            </motion.div>

            {/* No Results */}
            {filteredModels.length === 0 && (
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