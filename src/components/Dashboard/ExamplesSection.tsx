// src/components/Dashboard/ExamplesSection.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ExampleAnalysis {
  id: string;
  slug: string;
  question: string;
  title: string;
  category: string;
}

interface ExamplesSectionProps {
  // Remove onExampleClick since we're now using Links
}

const ExamplesSection: React.FC<ExamplesSectionProps> = () => {
  const [examples, setExamples] = useState<ExampleAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const { data, error } = await supabase
        .from('example_analyses')
        .select('id, slug, question, title, category')
        .eq('is_active', true)
        .order('view_count', { ascending: false })
        .limit(9); // Fetch more in case we want to show more later

      if (error) throw error;
      
      if (data) {
        setExamples(data);
      }
    } catch (error) {
      console.error('Error fetching examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleExamples = showAll ? examples : examples.slice(0, 6);

  const getCategoryColor = (category: string) => {
    const colors = {
      business: '#10B981',
      personal: '#F59E0B',
      behavioral: '#8B5CF6',
      strategic: '#EF4444',
      conceptual: '#06B6D4',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full"
      >
        <div className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#333333]/60 to-[#333333]/40 rounded-lg">
              <Lightbulb className="h-5 w-5 text-[#00FFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Examples</h3>
              <p className="text-xs text-gray-400 mt-0.5">Loading examples...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-[#2A2A2A]/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  if (examples.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/40 hover:border-[#333333]/60 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#333333]/60 to-[#333333]/40 rounded-lg">
              <Lightbulb className="h-5 w-5 text-[#00FFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Examples</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Explore real analyses
              </p>
            </div>
          </div>
          
          {examples.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              {showAll ? 'Show Less' : `View All (${examples.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {visibleExamples.map((example, index) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/examples/${example.slug}`}
                  className="group block h-full"
                >
                  <div className="relative h-full p-4 bg-[#2A2A2A]/50 hover:bg-[#2A2A2A]/80 border border-[#444444]/40 hover:border-[#00FFFF]/30 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00FFFF]/10">
                    {/* Category Dot */}
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(example.category) }}
                      />
                      <span className="text-xs text-gray-400 capitalize">{example.category}</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors mb-1">
                      {example.title}
                    </h4>

                    {/* Query Preview */}
                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-2 mb-3">
                      {example.question}
                    </p>

                    {/* View Analysis Link */}
                    <div className="flex items-center text-[#00FFFF] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View Full Analysis
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00FFFF]/0 to-[#00FFFF]/0 group-hover:from-[#00FFFF]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Examples Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <Link
            to="/examples"
            className="inline-flex items-center gap-2 text-sm text-[#00FFFF] hover:text-[#00FFFF]/80 transition-colors"
          >
            Browse All Examples
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ExamplesSection;